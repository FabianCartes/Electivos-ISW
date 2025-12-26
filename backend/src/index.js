import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/configDB.js'; 
import { envs } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Base de Datos conectada exitosamente!');

    const app = express();
    
    app.use(cors({
    origin: [
      'http://localhost:5173',      
      'http://146.83.198.35:1345' 
    ],
    credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());
    
    // Servir archivos estáticos (PDFs) - solo para profesores autenticados
    app.use('/uploads', (req, res, next) => {
      // Verifica que exista un token de autorización antes de servir archivos
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No autorizado para acceder a archivos subidos' });
      }
      // En una implementación real, aquí se debería validar el token (JWT, etc.)
      next();
    }, express.static(path.join(__dirname, '../uploads'))); 
    
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