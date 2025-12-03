import { EntitySchema } from "typeorm";

export const ElectivoCupo = new EntitySchema({
  name: "ElectivoCupo",
  tableName: "electivos_cupos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    carrera: {
      type: "varchar", // Ej: "Ing. Civil Informática"
      nullable: false,
    },
    cupos: {
      type: "int",
      nullable: false,
    },
    electivoId: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    electivo: {
      type: "many-to-one",
      target: "Electivo",
      inverseSide: "cuposPorCarrera", // Relación inversa en la otra entidad
      joinColumn: { name: "electivoId" },
      onDelete: "CASCADE", // Si se borra el electivo, se borran sus cupos
    },
  },
});