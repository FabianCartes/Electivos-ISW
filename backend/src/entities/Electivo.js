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
    status: {
      type: "enum",
      // estado permitidos
      enum: ["PENDIENTE", "APROBADO", "RECHAZADO"],
      default: "PENDIENTE",
    },
    // columna de la clave foranea
    profesorId: {
      type: "int",
      nullable: false, // Un electivo debe tener un profesor
    },
  },
  relations: {
    // muchos electivos pertenecen a UN usuario profesor
    profesor: {
      type: "many-to-one",
      target: "User", // apunta al 'name' de la entidad User
      inverseSide: "electivosComoProfesor",
      joinColumn: {
        name: "profesorId", // usa la columna 'profesorId' para la relacion
      },
      onDelete: "SET NULL", // si se borra el profe, el electivo queda sin profe
    },
    // un electivo tiene muchas inscripciones
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "electivo",
    },
  },
});