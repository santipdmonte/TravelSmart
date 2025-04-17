# TravelSmart Frontend

Este es un proyecto frontend para TravelSmart creado con React, TypeScript, Vite y Tailwind CSS.

## Estructura del Proyecto

```
travelsmart-frontend/
├── src/
│   ├── assets/       # Imágenes, fuentes y otros archivos estáticos
│   ├── components/   # Componentes reutilizables
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Componentes de página
│   ├── services/     # Servicios para API y otras funcionalidades externas
│   ├── types/        # Definiciones de tipos TypeScript
│   ├── utils/        # Utilidades y helpers
│   ├── App.tsx       # Componente principal
│   ├── main.tsx      # Punto de entrada
│   └── index.css     # Estilos globales con Tailwind
├── public/           # Archivos accesibles públicamente
├── index.html        # Plantilla HTML
├── tailwind.config.js # Configuración de Tailwind CSS
├── postcss.config.js # Configuración de PostCSS
├── tsconfig.json     # Configuración de TypeScript
└── vite.config.ts    # Configuración de Vite
```

## Instalación

1. Clona el repositorio
```bash
git clone <url-del-repositorio>
cd travelsmart-frontend
```

2. Instala las dependencias
```bash
npm install
```

3. Inicia el servidor de desarrollo
```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run lint` - Ejecuta el linter para verificar la calidad del código
- `npm run preview` - Vista previa de la build de producción localmente

## Buenas Prácticas Implementadas

- **Estructura de carpetas organizada** - Código organizado por funcionalidad
- **Componentes reutilizables** - Componentes como Button diseñados para ser utilizados en toda la aplicación
- **Custom hooks** - Hooks personalizados como useLocalStorage para lógica reutilizable
- **TypeScript** - Tipado estático para reducir errores y mejorar la documentación
- **Tailwind CSS** - Utilidades CSS para un diseño consistente y eficiente
- **Persistencia de datos** - Uso del localStorage para almacenar datos entre sesiones

## Tecnologías Utilizadas

- [React](https://react.dev/) - Biblioteca de UI
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Vite](https://vitejs.dev/) - Herramienta de compilación rápida
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
