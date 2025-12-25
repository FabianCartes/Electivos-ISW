export const CARRERAS_CANONICAS = [
  "Ingeniería Civil en Informática",
  "Ingeniería de Ejecución en Computación",
  "Ingeniería Civil Industrial",
  "Ingeniería Comercial",
  "Otras"
];

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCarrera(input) {
  const v = (input ?? '').toString().trim();
  if (!v) return null; // cuando es obligatorio, el consumidor valida null
  const key = removeAccents(v).toUpperCase();
  const map = {
    'INGENIERIA CIVIL EN INFORMATICA': 'Ingeniería Civil en Informática',
    'INGENIERIA DE EJECUCION EN COMPUTACION': 'Ingeniería de Ejecución en Computación',
    'INGENIERIA CIVIL INDUSTRIAL': 'Ingeniería Civil Industrial',
    'INGENIERIA COMERCIAL': 'Ingeniería Comercial',
    'OTRAS': 'Otras'
  };
  return map[key] ?? 'Otras';
}
