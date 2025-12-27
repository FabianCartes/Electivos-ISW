import { Router } from "express";
import authRoutes from "./auth.routes.js";
import electivoRoutes from "./electivo.routes.js";
import inscripcionRoutes from "./inscripcion.routes.js";
import userRoutes from "./user.routes.js";
import periodoRoutes from "./periodo.routes.js";
import notificationRoutes from "./notification.routes.js";


export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/electivos", electivoRoutes);
  router.use("/inscripcion", inscripcionRoutes);
  router.use("/usuarios", userRoutes);
  router.use("/periodo", periodoRoutes);
  router.use("/notificaciones", notificationRoutes);
  
}
