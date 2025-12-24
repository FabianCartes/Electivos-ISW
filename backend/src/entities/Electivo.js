import { EntitySchema } from "typeorm";

export const Electivo = new EntitySchema({
  name: "Electivo",
  tableName: "electivos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    codigoElectivo: {
      type: "int",
      nullable: false,
    },
    titulo: {
      type: "varchar",
      nullable: false,
    },
    sala: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    observaciones: {
      type: "text",
      nullable: true,
    },
    // Periodo Académico
    anio: {
      type: "int",
      nullable: false,
    },
    semestre: {
      type: "enum",
      enum: ["1", "2"],
      default: "1",
      nullable: false,
    },
    // Requisitos previos
    requisitos: {
      type: "text",
      nullable: true, 
    },
    // Ayudante (Opcional)
    ayudante: {
      type: "varchar",
      nullable: true, 
    },
    // ✅ NUEVO CAMPO: Para guardar el feedback si se rechaza
    motivo_rechazo: {
      type: "text",
      nullable: true, // Será null mientras esté PENDIENTE o APROBADO
    },
    status: {
      type: "enum",
      enum: ["PENDIENTE", "APROBADO", "RECHAZADO"],
      default: "PENDIENTE",
    },
    profesorId: {
      type: "int",
      nullable: false,
    },
    // Ruta o URL al archivo PDF del syllabus (no se almacena el binario en la BD)
    syllabusPDF: {
      type: "varchar",
      nullable: true,
    },
    syllabusName: {
      type: "varchar",
      nullable: true, 
    },
  },
  uniques: [
    { columns: ["codigoElectivo", "anio", "semestre"] },
  ],
  relations: {
    // Relación con el Profesor
    profesor: {
      type: "many-to-one",
      target: "User",
      inverseSide: "electivosComoProfesor",
      joinColumn: { name: "profesorId" },
      onDelete: "SET NULL",
    },
    
    // Cupos por Carrera
    cuposPorCarrera: {
      type: "one-to-many",
      target: "ElectivoCupo",
      inverseSide: "electivo",
      cascade: true, // Esto permite guardar y eliminar los cupos automáticamente
      onDelete: "CASCADE", // Elimina cupos cuando se elimina el electivo
    },

    // Relación con Inscripciones
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "electivo",
      onDelete: "CASCADE", // Elimina inscripciones cuando se elimina el electivo
    },

    // Relación con Horarios (Un electivo - Muchos horarios)
    horarios: {
      type: "one-to-many",
      target: "HorarioElectivo",
      inverseSide: "electivo",
      cascade: true, // Esto permite guardar y eliminar los horarios automáticamente
      onDelete: "CASCADE", // Elimina horarios cuando se elimina el electivo
    },
  },
});