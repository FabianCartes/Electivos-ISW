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
    // Jefe de carrera que configuró este periodo
    jefeCarreraId: { type: "int", nullable: true },
    // Flags para controlar notificaciones por correo
    correo_inicio_enviado: { type: "boolean", default: false },
    correo_semana_antes_enviado: { type: "boolean", default: false },
    correo_fin_enviado: { type: "boolean", default: false },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  uniques: [
    { name: "UQ_PERIODO_ANIO_SEMESTRE", columns: ["anio", "semestre"] }
  ],
  relations: {
    jefeCarrera: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "jefeCarreraId" },
      onDelete: "SET NULL",
    },
  },
});
