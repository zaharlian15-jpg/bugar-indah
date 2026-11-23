/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FA',
        surface: '#FFFFFF',
        obsidian: {
          DEFAULT: '#0B132B',
          light: '#1C2541',
          dark: '#050A18',
        },
        caption: '#64748B',
        cobalt: {
          DEFAULT: '#1D4ED8',
          light: '#2563EB',
          hover: '#1E40AF',
          glow: '#3B82F6',
        },
        ticket: {
          amber: '#D97706',
          gold: '#F59E0B',
          paper: '#FEFDF9',
        },
        terminal: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
        },
        alert: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          subtle: '#FEF2F2',
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 19, 43, 0.05), 0 1px 2px -1px rgba(11, 19, 43, 0.05)',
        'tactile': '0 4px 6px -1px rgba(11, 19, 43, 0.07), 0 2px 4px -2px rgba(11, 19, 43, 0.05)',
        'lifted': '0 10px 25px -5px rgba(11, 19, 43, 0.10), 0 8px 10px -6px rgba(11, 19, 43, 0.05)',
        'ticket': '0 20px 40px -15px rgba(11, 19, 43, 0.15)',
      }
    },
  },
  plugins: [],
}
