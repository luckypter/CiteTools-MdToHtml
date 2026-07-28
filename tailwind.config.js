/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c6a5f',
          light: '#a89585',
          dark: '#5c4f47',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}