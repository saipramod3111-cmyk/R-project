/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E',
          900: '#0B132B',
          850: '#111C3D',
          800: '#1C2541',
          700: '#273456',
          600: '#3A506B',
        },
        medcyan: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        medblue: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(14, 165, 233, 0.25)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.25)',
        'card': '0 4px 20px -2px rgba(11, 19, 43, 0.5)',
      }
    },
  },
  plugins: [],
}
