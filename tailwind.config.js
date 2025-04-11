/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        primary: '#b5715f',
        'primary-dark': '#8b574a',
        background: '#FDF8F6',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
