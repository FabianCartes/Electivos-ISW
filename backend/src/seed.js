import { AppDataSource } from './config/configDB.js';
import { createUser } from './services/user.service.js';


const sampleUsers = [
  { nombre: 'Ana Profesor', email: 'ana.profesor@demo.cl', rut: '12.345.678-5', role: 'PROFESOR' },
  { nombre: 'Bruno Alumno',  email: 'bruno.alumno@demo.cl',  rut: '9.876.543-3',  role: 'ALUMNO' },
  { nombre: 'Carla Jefe',    email: 'carla.jefe@demo.cl',    rut: '7.654.321-6',  role: 'JEFE_CARRERA' },
];


const cleanRut = (rut) => rut.replace(/\./g, '').toUpperCase();

async function main() {
  try {
    console.log('Iniciando seed...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Base de datos conectada.');
    }

    for (const u of sampleUsers) {
      const rutLimpio = cleanRut(u.rut);
      const numero = rutLimpio.includes('-')
        ? rutLimpio.split('-')[0]
        : rutLimpio.slice(0, -1);
      const password = numero.slice(-5) || '12345';

      try {
        await createUser({ ...u, rut: rutLimpio, password });
        console.log(`[OK] ${u.nombre} (${u.role})`);
      } catch (err) {
        console.log(`[SKIP] ${u.nombre}: ${err.message}`);
      }
    }

    console.log('Seed finalizado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

main();