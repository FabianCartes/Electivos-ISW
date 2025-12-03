import { DataSource } from 'typeorm';
import { envs } from './configEnv.js';

// entidades
import { User } from '../entities/User.js';
import { Inscripcion } from '../entities/Inscripcion.js';
import { Electivo} from '../entities/Electivo.js';
import { ElectivoCupo } from '../entities/ElectivoCupo.js';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envs.dbHost,
  port: envs.dbPort,
  username: envs.dbUser,
  password: envs.dbPassword,
  database: envs.dbName,

  synchronize: true, // crea tablas automaticamente
  logging: false,     // sql en consola
  
  entities: [
    User,
    Inscripcion,
    Electivo,
    ElectivoCupo,
  ],
  
  subscribers: [],
  migrations: [],
});