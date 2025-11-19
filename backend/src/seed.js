import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './config/configDB.js'; 
import { createUser } from './services/user.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        console.log("Iniciando el proceso de carga de datos....");

        // inicializa la conexion a la base de datos
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Base de datos conectada.");
        }

        // lee el archivo excel
        const filePath = path.join(__dirname, 'data', 'usuarios.xlsx'); 
        
        console.log(`Leyendo archivo desde: ${filePath}`);
        
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // se toma la primera hoja
        const sheet = workbook.Sheets[sheetName];
        
        // convierte los datos de excel a JSON
        const data = xlsx.utils.sheet_to_json(sheet);
        
        console.log(`📄 Se encontraron ${data.length} usuarios para procesar.`);

        // itera sobre cada fila del excel y crea el usuario
        for (const row of data) {

            const { Nombre, Email, RUT, Rol } = row; 

            if (!RUT) {
                console.warn(`Fila saltada: No tiene RUT.`);
                continue;
            }
            // logica de la contraseña que sea los ultimos 5 digitos antes del digito verificador
            // formato 12345678-9 (con o sin puntos)
            
            const rutString = RUT.toString();
            const rutLimpio = rutString.replace(/\./g, ''); // quita los puntos: 12.345.678-9 --> 12345678-9
            
            let passwordGenerada = "";

            if (rutLimpio.includes('-')) {
                const [numero] = rutLimpio.split('-'); // "12345678"
                passwordGenerada = numero.slice(-5);   // "45678"
            } else {
                // si por error el rut en el excel no tiene guion, toma todo menos el ultimo digito
                const numero = rutLimpio.slice(0, -1);
                passwordGenerada = numero.slice(-5);
            }

            try {
                // llama al servicio createUser
                await createUser({
                    nombre: Nombre,
                    email: Email,
                    rut: rutLimpio,       // guarda el rut limpio
                    password: passwordGenerada, // el servicio se encarga de encriptarla
                    role: Rol             // PROFESOR, ALUMNO, JEFE_CARRERA
                });
                console.log(`[OK] Usuario creado: ${Nombre} (Rol: ${Rol})`);
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