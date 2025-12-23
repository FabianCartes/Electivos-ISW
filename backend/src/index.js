import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/configDB.js'; 
import { envs } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para manejar FormData
const upload = multer({
  storage: multer.memoryStorage(), // Guardar en memoria antes de procesar
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo aceptar PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos PDF'), false);
    }
  }
});

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Base de Datos conectada exitosamente!');

    const app = express();
    app.use(cors({
    origin: 'http://localhost:5173', // url frontend
    credentials: true //para que pasen las cookies
    }));
    app.use(express.json());
    app.use(cookieParser());
    
    // Servir archivos estáticos (PDFs)
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Middleware multer para manejar FormData
    app.use(upload.single('syllabusPDF')); 
    
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