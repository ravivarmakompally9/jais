/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#f6f5f0',
        surface: '#ffffff',
        'surface-alt': '#efeee8',
        sidebar: '#16213e',
        'sidebar-hover': '#1f2d54',
        gold: '#b8941f',
        'gold-soft': '#e7d28a',
        success: '#0d7c5f',
        'success-soft': '#d6efe5',
        danger: '#c42b2b',
        'danger-soft': '#f7dada',
        warning: '#c47f10',
        'warning-soft': '#fbeacd',
        info: '#1d5faf',
        'info-soft': '#dbe8f8',
        ink: '#1a1a2e',
        muted: '#7c8098',
        line: '#e2e0d8',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 20, 40, 0.04), 0 4px 12px rgba(20, 20, 40, 0.04)',
        card: '0 1px 0 rgba(20, 20, 40, 0.04), 0 12px 32px -16px rgba(20, 20, 40, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-gold': 'pulseGold 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
