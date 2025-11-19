import Joi from 'joi';

export const authBodyValidation = Joi.object({
    rut: Joi.string()
        .required()
        .min(8)   // 1.111.111-1 (minimo razonable)
        .max(12)  // 12.345.678-9 (largo maximo con puntos)
        //permite numeros, puntos, guion y la letra K (mayuscula o minuscula)
        .pattern(/^[0-9\.\-kK]+$/)
        .messages({
            "string.empty": "El RUT no debe estar vacío",
            "any.required": "El RUT es obligatorio",
            "string.min": "El RUT es muy corto",
            "string.max": "El RUT es muy largo",
            "string.pattern.base": "El RUT contiene caracteres inválidos (solo números, puntos, guión y K)"
        }),
    password: Joi.string()
        .min(5)
        .max(50)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
        .messages({
            "string.empty": "La contraseña no debe estar vacía",
            "any.required": "La contraseña es obligatoria",
            "string.base": "La contraseña debe ser un texto",
            "string.pattern.base": "La contraseña debe tener solo letras y números."
        })
});