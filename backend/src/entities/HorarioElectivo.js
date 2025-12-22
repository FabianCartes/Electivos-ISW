import { EntitySchema } from "typeorm";

export const HorarioElectivo = new EntitySchema({
  name: "HorarioElectivo",
  tableName: "horarios_electivos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    dia: {
      type: "enum",
      enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"],
      nullable: false,
    },
    horaInicio: {
      type: "time",
      nullable: false,
    },
    horaTermino: {
      type: "time",
      nullable: false,
    },
    electroId: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    // Relación con el Electivo (Muchos horarios -> Un electivo)
    electivo: {
      type: "many-to-one",
      target: "Electivo",
      inverseSide: "horarios",
      joinColumn: { name: "electroId" },
      onDelete: "CASCADE",
    },
  },
});
