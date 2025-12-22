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
    // Periodo Académico: sera definido por año[actual, ~[  y semestre[1,2]
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
    syllabusPDF: { // Aca se guarda el programa del electivo//
      type: "bytea",
      nullable: true,
    },
    syllabusName: { //nombre original del pdf
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
  },
});