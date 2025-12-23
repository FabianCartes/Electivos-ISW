import { EntitySchema } from "typeorm";

export const Inscripcion = new EntitySchema({
  name: "Inscripcion",
  tableName: "inscripciones",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    status: {
      type: "enum",
      enum: ["PENDIENTE", "APROBADA", "RECHAZADA"],
      default: "PENDIENTE",
    },
    prioridad: {
      type: "int",
      nullable: false,
    },
    // ✅ ESTANDARIZADO: Usamos el mismo nombre que en Electivo
    motivo_rechazo: {
      type: "text",
      nullable: true, // Solo tendrá valor si status es RECHAZADA
    },
    // Claves foráneas
    alumnoId: {
      type: "int",
      nullable: false,
    },
    electivoId: {
      type: "int",
      nullable: false,
    },
  },
  // Restricción única: Un alumno no puede inscribir el mismo electivo dos veces
  uniques: [
    {
      name: "IDX_ALUMNO_ELECTIVO_UNICO",
      columns: ["alumnoId", "electivoId"],
    },
    {
      name: "IDX_ALUMNO_PRIORIDAD_UNICA",
      columns: ["alumnoId", "prioridad"],
    },
  ],
  relations: {
    alumno: {
      type: "many-to-one",
      target: "User",
      inverseSide: "inscripcionesComoAlumno",
      joinColumn: { name: "alumnoId" },
      onDelete: "CASCADE",
    },
    electivo: {
      type: "many-to-one",
      target: "Electivo",
      inverseSide: "inscripciones",
      joinColumn: { name: "electivoId" },
      onDelete: "CASCADE",
    },
  },
});