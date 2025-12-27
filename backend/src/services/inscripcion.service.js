import { AppDataSource } from "../config/configDB.js";
import { Inscripcion } from "../entities/Inscripcion.js";
import { User } from "../entities/User.js";
import { Electivo } from "../entities/Electivo.js";
import { ElectivoCupo } from "../entities/ElectivoCupo.js";
import { isInscripcionAbiertaPara, isPeriodoFinalizadoPara } from "./periodo.service.js";

export class InscripcionService {
	constructor() {
		this.repo = AppDataSource.getRepository(Inscripcion.options.name);
		this.userRepo = AppDataSource.getRepository(User.options?.name || User);
		this.electivoRepo = AppDataSource.getRepository(Electivo.options?.name || Electivo);
		this.electivoCupoRepo = AppDataSource.getRepository(ElectivoCupo.options?.name || ElectivoCupo);
	}

	async crearInscripcion({ alumnoId, electivoId, prioridad }) {
		// Validaciones básicas
		if (!alumnoId || !electivoId || prioridad === undefined || prioridad === null) {
			const err = new Error("Faltan campos requeridos: alumnoId, electivoId, prioridad");
			err.name = "ValidationError";
			throw err;
		}
		// Rango de prioridad (1-3); ajusta si quieres otro rango
		if (prioridad < 1 || prioridad > 3) {
			const err = new Error("La prioridad debe estar entre 1 y 3");
			err.name = "ValidationError";
			throw err;
		}

		// Validación de carrera y cupos por carrera
		const alumno = await this.userRepo.findOne({ where: { id: Number(alumnoId) }, select: ["id", "carrera"] });
		if (!alumno || !alumno.carrera) {
			const err = new Error("El alumno no tiene carrera registrada");
			err.name = "ValidationError";
			throw err;
		}

		const electivo = await this.electivoRepo.findOne({
			where: { id: Number(electivoId) },
			relations: ["cuposPorCarrera"]
		});
		if (!electivo) {
			const err = new Error("Electivo no encontrado");
			err.name = "ValidationError";
			throw err;
		}
    // Validar periodo abierto para el semestre del electivo
    const abierta = await isInscripcionAbiertaPara(electivo.anio, electivo.semestre);
    if (!abierta) {
      const err = new Error("La inscripción no está disponible para este semestre");
      err.name = "ValidationError";
      throw err;
    }
		const cupo = (electivo.cuposPorCarrera || []).find(c => c.carrera === alumno.carrera);
		if (!cupo) {
			const err = new Error("El electivo no ofrece cupos para tu carrera");
			err.name = "ValidationError";
			throw err;
		}

		const entity = this.repo.create({ alumnoId, electivoId, prioridad });
		try {
			return await this.repo.save(entity);
		} catch (e) {
			// errores por índices únicos
			if (e?.code === "23505") {
				// Postgres duplicate key
				const err = new Error("Inscripción duplicada o prioridad ya usada por el alumno");
				err.name = "ValidationError";
				throw err;
			}
			throw e;
		}
	}

	async listarInscripciones({ estado, electivoId, alumnoId, carreraAlumno } = {}) {
		const where = {};
		if (estado) where.status = estado;
		if (electivoId) where.electivoId = +electivoId;
		if (alumnoId) where.alumnoId = +alumnoId;
		if (carreraAlumno) {
			// Filtro por carrera del alumno (para JEFE_CARRERA)
			where.alumno = { carrera: carreraAlumno };
		}

		return await this.repo.find({ 
			where, 
			order: { prioridad: "ASC", id: "ASC" },
			relations: [
				"alumno",
				"electivo",
				"electivo.profesor",
				"electivo.cuposPorCarrera"
			]
		});
	}

	/**
	 * Obtiene las inscripciones de un electivo específico, validando que el electivo
	 * pertenece al profesor indicado. Opcionalmente filtra por estado.
	 */
	async getInscripcionesPorElectivoParaProfesor(profesorId, electivoId, estado = undefined) {
		if (!profesorId) {
			const err = new Error("No se pudo identificar al profesor");
			err.name = "ValidationError";
			throw err;
		}
		if (!electivoId || Number.isNaN(Number(electivoId))) {
			const err = new Error("electivoId es requerido y debe ser numérico");
			err.name = "ValidationError";
			throw err;
		}

		const electivo = await this.electivoRepo.findOne({
			where: { id: Number(electivoId) },
			relations: ["profesor"],
		});
		if (!electivo) {
			const err = new Error("Electivo no encontrado");
			err.name = "ValidationError";
			throw err;
		}
		const ownerId = electivo.profesor?.id ?? electivo.profesorId;
		if (Number(ownerId) !== Number(profesorId)) {
			const err = new Error("No tienes permiso para ver las inscripciones de este electivo");
			err.name = "ValidationError";
			throw err;
		}

    // Solo permitir ver después de finalizar el periodo de ese semestre
    const finalizado = await isPeriodoFinalizadoPara(electivo.anio, electivo.semestre);
    if (!finalizado) {
      const err = new Error("Podrás ver las inscripciones una vez finalice el periodo");
      err.name = "ValidationError";
      throw err;
    }

		const where = { electivoId: Number(electivoId) };
		if (estado) where.status = estado;

		return await this.repo.find({
			where,
			relations: ["alumno", "electivo"],
			order: { prioridad: "ASC", id: "ASC" },
		});
	}

	async cambiarEstado(id, nuevoEstado, motivo_rechazo = null) {
		if (!id) {
			const err = new Error("Id de inscripción requerido");
			err.name = "ValidationError";
			throw err;
		}
		if (!["APROBADA", "RECHAZADA", "PENDIENTE"].includes(nuevoEstado)) {
			const err = new Error("Estado inválido");
			err.name = "ValidationError";
			throw err;
		}

		const insc = await this.repo.findOne({ where: { id: +id } });
		if (!insc) {
			const err = new Error("Inscripción no encontrada");
			err.name = "ValidationError";
			throw err;
		}

		// Si vamos a aprobar, verifiquemos cupos disponibles por carrera y decrementemos disponibilidad
		if (nuevoEstado === "APROBADA") {
			// Evitar doble decremento si ya está aprobada
			if (insc.status === "APROBADA") {
				return insc; // ya aprobada, no hacemos nada
			}
			const alumno = await this.userRepo.findOne({ where: { id: Number(insc.alumnoId) }, select: ["id", "carrera"] });
			if (!alumno || !alumno.carrera) {
				const err = new Error("El alumno no tiene carrera registrada");
				err.name = "ValidationError";
				throw err;
			}
			const electivo = await this.electivoRepo.findOne({ where: { id: Number(insc.electivoId) }, relations: ["cuposPorCarrera"] });
			if (!electivo) {
				const err = new Error("Electivo no encontrado");
				err.name = "ValidationError";
				throw err;
			}
			const cupo = (electivo.cuposPorCarrera || []).find(c => c.carrera === alumno.carrera);
			if (!cupo) {
				const err = new Error("El electivo no ofrece cupos para la carrera del alumno");
				err.name = "ValidationError";
				throw err;
			}
			// Chequeo de disponibilidad actual (cupo.cupos representa disponibles)
			if ((cupo.cupos ?? 0) <= 0) {
				const err = new Error("Sin cupos disponibles para esta carrera");
				err.name = "ValidationError";
				throw err;
			}
			// Decremento atómico en BD para evitar condiciones de carrera
			const result = await this.electivoCupoRepo.decrement({ id: cupo.id }, "cupos", 1);
			// Opcional: verificar que afectó filas
			if (result?.affected === 0) {
				const err = new Error("No fue posible reservar cupo para esta carrera");
				err.name = "ValidationError";
				throw err;
			}
		}
		insc.status = nuevoEstado;
		insc.motivo_rechazo = nuevoEstado === "RECHAZADA" ? motivo_rechazo ?? null : null;
		return await this.repo.save(insc);
	}

	async getInscripcionesPorAlumno(alumnoId) {
        return await this.repo.find({
            where: { alumnoId: Number(alumnoId) },
            relations: ["electivo", "electivo.horarios", "electivo.profesor"], //  datos del electivo
            order: { prioridad: "ASC" }
        });
    }

}
