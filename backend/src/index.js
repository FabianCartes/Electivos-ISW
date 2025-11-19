import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/configDB.js'; 
import { envs } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import cookieParser from 'cookie-parser';

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Base de Datos conectada exitosamente!');

    const app = express();
    app.use(express.json());
    app.use(cookieParser()); 
    
    app.get('/', (req, res) => {
      res.send('API del proyecto de ISW funcionando');
    });

    routerApi(app);

    app.listen(envs.appPort, () => {
      console.log(`Servidor corriendo en http://${envs.appHost}:${envs.appPort}`);
    });

  } catch (error) {
    console.error('Error al conectar la base de datos:');
    console.error(error);
  }
}

main();