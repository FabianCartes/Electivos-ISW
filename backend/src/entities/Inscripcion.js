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
      // estados permitidos
      enum: ["PENDIENTE", "APROBADA", "RECHAZADA"],
      default: "PENDIENTE",
    },
    razon_rechazo: {
      type: "text",
      nullable: true, // opcional
    },
    // columna para la clave foranea del alumno
    alumnoId: {
      type: "int",
    },
    // columna para la clave foranea del electivo
    electivoId: {
      type: "int",
    },
  },
  // evita que un alumno se inscriba 2 veces al mismo electivo
  uniques: [
    {
      name: "IDX_ALUMNO_ELECTIVO_UNICO",
      columns: ["alumnoId", "electivoId"],
    },
  ],
  relations: {
    // muchas inscripciones pertenecen a UN usuario alumno
    alumno: {
      type: "many-to-one",
      target: "User",
      inverseSide: "inscripcionesComoAlumno",
      joinColumn: {
        name: "alumnoId",
      },
      onDelete: "CASCADE", // si se borra el alumno, se borran sus inscripciones
    },
    // muchas inscripciones son para UN electivo
    electivo: {
      type: "many-to-one",
      target: "Electivo",
      inverseSide: "inscripciones",
      joinColumn: {
        name: "electivoId",
      },
      onDelete: "CASCADE", // si se borra el electivo, se borran las inscripciones
    },
  },
});