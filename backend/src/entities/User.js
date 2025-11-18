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
    // ✅ NUEVO CAMPO AGREGADO
    rut: {
      type: "varchar",
      unique: true,      // No pueden haber dos usuarios con el mismo RUT
      nullable: false,   // Es obligatorio
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
    electivosComoProfesor: {
      type: "one-to-many",
      target: "Electivo",
      inverseSide: "profesor",
    },
    inscripcionesComoAlumno: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "alumno",
    },
  },
});