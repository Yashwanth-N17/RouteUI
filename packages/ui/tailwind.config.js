/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        methodGet: '#10B981', // green-500
        methodPost: '#3B82F6', // blue-500
        methodPut: '#F59E0B', // orange-500
        methodDelete: '#EF4444', // red-500
        methodPatch: '#FBBF24', // yellow-500
      },
    },
  },
  plugins: [],
};
