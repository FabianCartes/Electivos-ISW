import 'dotenv/config'; 

export const envs = {
  // variables de Base de Datos
  dbHost:     process.env.DB_HOST,
  dbPort:     Number(process.env.DB_PORT),
  dbUser:     process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName:     process.env.DATABASE,

  // variables de la aplicacion
  appHost:    process.env.HOST,
  appPort:    Number(process.env.PORT),
  jwtSecret:  process.env.JWT_SECRET,
  cookieKey:  process.env.COOKIE_KEY,
};