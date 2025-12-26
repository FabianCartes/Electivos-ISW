import Joi from 'joi';

export const createElectivoSchema = Joi.object({
    codigoElectivo: Joi.number()
        .integer()
        .min(100000)
        .max(999999)
        .required()
        .messages({
            'number.min': 'El código del electivo debe ser un número entero entre 100000 y 999999',
            'number.max': 'El código del electivo debe ser un número entero entre 100000 y 999999',
            'any.required': 'El código del electivo es obligatorio'
        }),
    titulo: Joi.string().required(),
    sala: Joi.string()
        .max(50)
        .required(),
    observaciones: Joi.string().allow(null, '').optional(),
    anio: Joi.number()
        .integer()
        .min(new Date().getFullYear())
        .required()
        .messages({'number.min': `El año debe ser ${new Date().getFullYear() } o posterior.`}),
    
    semestre: Joi.string()
        .valid('1', '2')
        .required(),
    requisitos: Joi.string().allow(null, '').optional(),
    ayudante: Joi.string().allow(null, ''),
    syllabusPDF: Joi.any()
        .required()
        .custom((value, helpers) => {
            // Si el valor se parece a un objeto archivo con mimetype, validar que sea PDF
            if (value && typeof value === 'object' && 'mimetype' in value) {
                if (value.mimetype !== 'application/pdf') {
                    return helpers.error('any.invalid', { message: 'El archivo del Programa del Electivo debe ser un PDF.' });
                }
            }
            return value;
        }, 'PDF file validation'),
    cuposList: Joi.array()
        .items(
            Joi.object({
                carrera: Joi.string().required(),
                cupos: Joi.number().integer().min(1).required()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Debe asignar cupos a al menos una carrera'
        }),
    horarios: Joi.array()
        .items(
            Joi.object({
                dia: Joi.string()
                    .valid('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES')
                    .required(),
                horaInicio: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'La hora inicio debe estar en formato HH:MM'
                    }),
                horaTermino: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'La hora termino debe estar en formato HH:MM'
                    })
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Debe agregar al menos un horario'
        })
});


export const updateElectivoSchema = Joi.object({
    codigoElectivo: Joi.number()
        .integer()
        .min(100000)
        .max(999999)
        .optional()
        .messages({
            'number.min': 'El código del electivo debe ser un número de 6 dígitos',
            'number.max': 'El código del electivo debe ser un número de 6 dígitos'
        }),
    titulo: Joi.string().optional(),
    sala: Joi.string()
        .max(50)
        .optional(),
    observaciones: Joi.string().allow(null, '').optional(),
    anio: Joi.number()
        .integer()
        .min(new Date().getFullYear())
        .optional()
        .messages({'number.min': `El año debe ser ${new Date().getFullYear()} o posterior.`}),
    
    semestre: Joi.string()
        .valid('1', '2')
        .optional(),
    requisitos: Joi.string().optional(),
    ayudante: Joi.string().allow(null, '').optional(),
    syllabusPDF: Joi.any().optional(),
    cuposList: Joi.array()
        .items(
            Joi.object({
                carrera: Joi.string().required(),
                cupos: Joi.number().integer().min(1).required()
            })
        )
        .min(1)
        .optional()
        .messages({
            'array.min': 'Debe asignar cupos a al menos una carrera'
        }),
    horarios: Joi.array()
        .items(
            Joi.object({
                dia: Joi.string()
                    .valid('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES')
                    .required(),
                horaInicio: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'La hora inicio debe estar en formato HH:MM'
                    }),
                horaTermino: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'La hora termino debe estar en formato HH:MM'
                    })
            })
        )
        .optional()
});


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
