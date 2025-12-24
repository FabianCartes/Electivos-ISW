import { AppDataSource } from "../config/configDB.js";
import { Inscripcion } from "../entities/Inscripcion.js";

export class InscripcionService {
	constructor() {
		this.repo = AppDataSource.getRepository(Inscripcion.options.name);
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

	async listarInscripciones({ estado, electivoId, alumnoId } = {}) {
		const where = {};
		if (estado) where.status = estado;
		if (electivoId) where.electivoId = +electivoId;
		if (alumnoId) where.alumnoId = +alumnoId;

		return await this.repo.find({ where, order: { prioridad: "ASC", id: "ASC" } });
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
		insc.status = nuevoEstado;
		insc.motivo_rechazo = nuevoEstado === "RECHAZADA" ? motivo_rechazo ?? null : null;
		return await this.repo.save(insc);
	}

	async getInscripcionesPorAlumno(alumnoId) {
        return await this.repo.find({
            where: { alumnoId: Number(alumnoId) },
            relations: ["electivo", "electivo.horarios", "electivo.profesor"], // Importante: Traer datos del electivo
            order: { prioridad: "ASC" }
        });
    }

}
