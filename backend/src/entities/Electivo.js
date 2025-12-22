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
      unique: true,
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
      nullable: false, 
    },
    // Ayudante (Opcional)
    ayudante: {
      type: "varchar",
      nullable: true, 
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
    syllabusPDF: {
      type: "bytea",
      nullable: true,
    },
    syllabusName: {
      type: "varchar",
      nullable: true, 
    },
  },
  relations: {
    // Relación con el Profesor (Muchos electivos -> Un profesor)
    profesor: {
      type: "many-to-one",
      target: "User",
      inverseSide: "electivosComoProfesor",
      joinColumn: { name: "profesorId" },
      onDelete: "SET NULL",
    },
    
    // Cupos por Carrera (Un electivo - Muchos registros de cupos)
    cuposPorCarrera: {
      type: "one-to-many",
      target: "ElectivoCupo", // Asegúrate de tener esta entidad creada
      inverseSide: "electivo",
      cascade: true, // Esto permite guardar los cupos automáticamente al guardar el electivo
    },

    // Relación con Inscripciones
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "electivo",
    },

    // Relación con Horarios (Un electivo - Muchos horarios)
    horarios: {
      type: "one-to-many",
      target: "HorarioElectivo",
      inverseSide: "electivo",
      cascade: true,
    },
  },
});