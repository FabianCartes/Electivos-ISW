import { createElectivo } from "../services/electivo.service.js";

export const handleCreateElectivo = async (req, res) => {
  try {
    //Extraemos los datos del electivo del 'body' de la peticion
    const electivoData = req.body;

    //Extraemos el ID del profesor que está logeado
    const profesorId = req.user.sub;

    //Validamos que el middleware haya puesto el ID
    if (!profesorId) {
      return res.status(401).json({ 
        message: "No autorizado. ID de usuario no encontrado." 
      });
    }

    //Llamamos al servicio para que haga la lógica de negocio
    const nuevoElectivo = await createElectivo(electivoData, profesorId);

    //Respondemos al cliente con éxito
    res.status(201).json({
      message: "Electivo creado exitosamente y pendiente de aprobación.",
      electivo: nuevoElectivo,
    });

  } catch (error) {
    const statusCode = error.status || 500;
    
    res.status(statusCode).json({
      message: error.message,
    });
  }
};