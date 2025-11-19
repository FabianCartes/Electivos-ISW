export function cleanRut(rut) {
    if (!rut) return null;
    
    // quita puntos, espacios y convierte a mayusculas
    let cleaned = rut.toString().toUpperCase().replace(/\./g, '').trim();
    
    // si tiene guion, lo dejamos para que coincida con el formato de la BD
    if (!cleaned.includes('-')) {
        // asumimos que el ultimo digito es el verificador si no hay guion
        const dv = cleaned.slice(-1);
        const numero = cleaned.slice(0, -1);
        cleaned = `${numero}-${dv}`;
    }
    
    return cleaned; // ej: 12345678-9
}