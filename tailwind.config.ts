import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        rose: {
          50: '#FDF5F6',  // Blush / App Surface
          100: '#F6E4E7',
          200: '#E8B4BB', // Petal / Light Accent
          300: '#DDA2AB',
          400: '#D48A96',
          500: '#C9697A', // Rosa / Primary
          600: '#B55667',
          700: '#9E4453',
          800: '#8A3644',
          900: '#1C1012', // Ink / Dark Color
        },
      },
      spacing: {
        '13': '3.25rem', // 52px (minimum touch target size per requirements)
        '14': '3.5rem',  // 56px (minimum table row height per requirements)
      }
    },
  },
  plugins: [],
};
export default config;
