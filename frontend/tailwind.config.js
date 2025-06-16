/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "travel-primary": {
          DEFAULT: "#3B82F6", // El azul principal de los botones y headers
          dark: "#2563EB",
        },
        "travel-secondary": {
          light: "#EFF6FF", // El fondo celeste muy claro de los items de transporte
          DEFAULT: "#DBEAFE", // Un tono más fuerte si es necesario
        },
        "travel-surface": "#FFFFFF", // Blanco para las tarjetas
        "travel-background": "#F9FAFB", // Un gris muy claro para el fondo de la página
        "travel-text": {
          dark: "#1F2937", // Texto principal oscuro
          DEFAULT: "#374151", // Texto secundario
          light: "#F9FAFB", // Texto sobre fondos oscuros
        },
      },
    },
  },
  plugins: [],
};
