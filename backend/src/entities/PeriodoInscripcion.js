import { EntitySchema } from "typeorm";

export const PeriodoInscripcion = new EntitySchema({
  name: "PeriodoInscripcion",
  tableName: "periodo_inscripcion",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    anio: { type: "int", nullable: false },
    semestre: { type: "enum", enum: ["1", "2"], nullable: false },
    inicio: { type: "timestamp", nullable: false },
    fin: { type: "timestamp", nullable: false },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  uniques: [
    { name: "UQ_PERIODO_ANIO_SEMESTRE", columns: ["anio", "semestre"] }
  ],
});
