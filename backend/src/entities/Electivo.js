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
    cupos_totales: {
      type: "int",
      nullable: false,
    },
    requisitos: {
      type: "text",
      nullable: false, 
    },
    ayudante: {
      type: "varchar",
      nullable: true, // opcional, puede ser null si no hay ayudante
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
    profesor: {
      type: "many-to-one",
      target: "User",
      inverseSide: "electivosComoProfesor",
      joinColumn: { name: "profesorId" },
      onDelete: "SET NULL",
    },
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "electivo",
    },
  },
});