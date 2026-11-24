/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#030712',
        space: {
          950: '#02040a',
          900: '#050b14',
          800: '#0c1626',
          700: '#14233c',
          600: '#1e355b'
        },
        nexus: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#7f00ff',
          violet: '#e100ff',
          neon: '#00ffcc',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(79, 172, 254, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(127, 0, 255, 0.4)',
        'glow-neon': '0 0 25px -5px rgba(0, 255, 204, 0.4)',
        'neon-border': '0 0 15px rgba(0, 242, 254, 0.3), inset 0 0 15px rgba(0, 242, 254, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
