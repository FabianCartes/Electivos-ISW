# Frontend - Electivos ISW

Frontend construido con React, Vite y Tailwind CSS para el stack PERN.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se ejecutará en `http://localhost:3000`

## Build para producción

```bash
npm run build
```

## Estructura del proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas de la aplicación
│   ├── services/       # Servicios API y lógica de negocio
│   ├── context/        # Contextos de React (Auth, etc.)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilidades y helpers
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales con Tailwind
├── index.html          # HTML principal
├── vite.config.js      # Configuración de Vite
├── tailwind.config.js  # Configuración de Tailwind
└── postcss.config.js   # Configuración de PostCSS
```

## Configuración

- **Vite**: Configurado con proxy hacia el backend en `http://localhost:5000`
- **Tailwind CSS**: Configurado y listo para usar
- **React Router**: Incluido para el manejo de rutas
- **Axios**: Configurado con interceptores para autenticación
