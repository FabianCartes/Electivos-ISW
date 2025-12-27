// Normaliza el RUT: quita puntos/espacios, fuerza mayúsculas y asegura guion antes del DV.
export function normalizeRut(rut) {
    if (!rut) return null;
    const clean = rut.toString().trim().toUpperCase().replace(/\./g, '');
    if (!clean) return null;

    if (clean.includes('-')) {
        return clean;
    }

    // Si no trae guion, separa último carácter como DV.
    const dv = clean.slice(-1);
    const numero = clean.slice(0, -1);
    return `${numero}-${dv}`;
}

// Valida DV con módulo 11. Acepta K/k.
export function isValidRut(rut) {
    const normalized = normalizeRut(rut);
    if (!normalized) return false;

    const [body, dvRaw] = normalized.split('-');
    if (!body || !dvRaw) return false;

    const dv = dvRaw.toUpperCase();
    let sum = 0;
    let mul = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }

    const res = 11 - (sum % 11);
    const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
    return dvCalc === dv;
}

// Alias mantenido para compatibilidad si alguien lo importa.
export function cleanRut(rut) {
    return normalizeRut(rut);
}