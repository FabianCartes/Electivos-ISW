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
    titulo: {
      type: "varchar",
      nullable: false,
    },
    descripcion: {
      type: "text",
      nullable: false,
    },
    // Periodo Académico (Año y Semestre separados)
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
      nullable: false, 
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
  },
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
      cascade: true,
    },

    // Relación con Inscripciones
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "electivo",
    },
  },
});