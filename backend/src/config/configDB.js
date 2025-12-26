import { DataSource } from 'typeorm';
import { envs } from './configEnv.js';

// entidades
import { User } from '../entities/User.js';
import { Inscripcion } from '../entities/Inscripcion.js';
import { Electivo} from '../entities/Electivo.js';
import { ElectivoCupo } from '../entities/ElectivoCupo.js';
import { HorarioElectivo } from '../entities/HorarioElectivo.js';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envs.dbHost,
  port: envs.dbPort,
  username: envs.dbUser,
  password: envs.dbPassword,
  database: envs.dbName,

  synchronize: true, // crea tablas automaticamente
  logging: false,     // sql en consola
  ssl: false, 
    // Si la línea de arriba da error en Typescript, usar condicionalmente:
    // ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },

    // Configuración de estabilidad de conexión (Pool)
    extra: {
        max: 20, // Conexiones máximas
        connectionTimeoutMillis: 10000, // Tiempo de espera antes de error
        idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexión inactiva
        keepAlive: true // Mantiene el socket TCP abierto
    },
  
  entities: [
    User,
    Inscripcion,
    Electivo,
    ElectivoCupo,
    HorarioElectivo,
  ],
  
  subscribers: [],
  migrations: [],
});