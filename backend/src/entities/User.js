import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    nombre: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "enum",
      enum: ["ALUMNO", "PROFESOR", "JEFE_CARRERA"],
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    // un usuario profesor tiene muchos electivos
    electivosComoProfesor: {
      type: "one-to-many",
      target: "Electivo", // apunta al 'name' de la entidad Electivo
      inverseSide: "profesor", // Apunta al campo 'profesor' en Electivo
    },
    // Un usuario alumno tiene muchas inscripciones
    inscripcionesComoAlumno: {
      type: "one-to-many",
      target: "Inscripcion", // Apunta al 'name' de la entidad Inscripcion
      inverseSide: "alumno", // Apunta al campo 'alumno' en Inscripcion
    },
  },
});