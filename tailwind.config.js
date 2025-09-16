  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Esto le dice a Tailwind dónde buscar tus componentes
    ],
    theme: {
      extend: {
        fontFamily: {
          inter: ['Inter', 'sans-serif'], // Define la fuente Inter
        },
      },
    },
    plugins: [],
  }
