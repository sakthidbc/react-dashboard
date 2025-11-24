/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          text: '#1e293b',
          muted: '#64748b',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
      },
          fontFamily: {
            sans: ['Poppins', 'system-ui', 'sans-serif'],
          },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

