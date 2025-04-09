import type { Config } from "tailwindcss"

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1a1a1a',
        primary: {
          DEFAULT: '#4a90e2',
          hover: '#357abd',
          light: '#6ba5e7',
          dark: '#2d6ba9'
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          hover: '#e5e7eb',
          foreground: '#1f2937'
        },
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#6b7280'
        },
        accent: {
          DEFAULT: '#f3f4f6',
          foreground: '#1f2937'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        white: "#ffffff",
        black: "#000000",
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617"
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712"
        },
        gold: {
          light: "#ffd700",
          DEFAULT: "#d4af37",
          dark: "#b8860b"
        },
      },
      fontFamily: {
        serif: ["Theano Didot", "serif"],
        playfair: ["var(--font-playfair)"],
        poppins: ["var(--font-poppins)"],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out'
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config

export default config 