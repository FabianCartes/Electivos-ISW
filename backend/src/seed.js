import 'reflect-metadata';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './config/configDB.js'; 
import { createUser } from './services/user.service.js';
import { normalizeCarrera } from './utils/carreraUtils.js';
import { isValidRut, normalizeRut} from './utils/rutUtils.js';


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function main() {
    try {
        console.log("Iniciando el proceso de carga de datos....");

        // inicializa la conexion a la base de datos
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Base de datos conectada.");
        }

        // lee el archivo excel
        const filePath = path.join(dirname, 'data', 'usuarios.xlsx'); 

        console.log(`Leyendo archivo desde: ${filePath}`);

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // se toma la primera hoja
        const sheet = workbook.Sheets[sheetName];

        // convierte los datos de excel a JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`📄 Se encontraron ${data.length} usuarios para procesar.`);

        // itera sobre cada fila del excel y crea el usuario
        for (const row of data) {

            const { Nombre, Email, RUT, Rol, Carrera } = row; 

            if (!RUT) {
                console.warn("Fila saltada: No tiene RUT.");
                continue;
            }
            // logica de la contraseña que sea los ultimos 5 digitos antes del digito verificador
            // formato 12345678-9 (con o sin puntos)

            const rutNormalizado = normalizeRut(RUT.toString());
            if (!isValidRut(rutNormalizado)) {
                console.warn(`Fila saltada: RUT inválido (${RUT}) para usuario ${Nombre}.`);
                continue;
            }

            // normalizeRut siempre retorna un RUT con guion, así que podemos asumir que tiene '-'
            const [numero] = rutNormalizado.split('-'); // "12345678"
            const passwordGenerada = numero.slice(-5);   // "45678"

            try {
                // normaliza el rol del excel para que coincida con el enum de la BD
                let rolNormalizado = (Rol ?? '').toString().trim().toUpperCase();
                if (rolNormalizado === 'JEFE CARRERA' || rolNormalizado === 'JEFE-CARRERA') {
                    rolNormalizado = 'JEFE_CARRERA';
                }

                // normaliza carrera (obligatoria para ALUMNO, opcional para otros roles)
                const carreraNorm = normalizeCarrera(Carrera);

                // llama al servicio createUser
                await createUser({
                    nombre: Nombre,
                    email: Email,
                    rut: rutNormalizado,       // guarda el rut limpio
                    password: passwordGenerada, // el servicio se encarga de encriptarla
                    role: rolNormalizado || undefined, // PROFESOR, ALUMNO, JEFE_CARRERA (si vacío, usa default del servicio)
                    carrera: carreraNorm
                });
                console.log(`[OK] Usuario creado: ${Nombre} (Rol: ${rolNormalizado || 'ALUMNO (default)'})`);
            } catch (error) {
                // si el usuario ya existe lanza error
                console.log(`[SKIP] ${Nombre}: ${error.message}`);
            }
        }

        console.log("Proceso de carga finalizado exitosamente!!!!!.");
        process.exit(0);

    } catch (error) {
        console.error("Error fatal en el script seed:", error);
        process.exit(1);
    }
}

main();