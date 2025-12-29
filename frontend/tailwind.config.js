/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Gentler Streak-inspired palette
        background: '#050505', // OLED black
        surface: '#1A1A1A', // Rich charcoal for cards
        'surface-light': '#252525', // Lighter surface
        primary: {
          DEFAULT: '#FF8C68', // Vitamin Orange
          hover: '#FF6B45', // Darker orange on hover
          light: '#FFAB8C', // Light orange
        },
        // Keep existing colors but rename for compatibility
        'orb-glow': '#FF8C68', // Changed from cyan to vitamin orange
        'danger': '#ff3366',
        'success': '#00ff88',
        'warning': '#ffaa00',
        // New premium colors
        muted: '#888888',
        'text-secondary': '#AAAAAA',
      },
      borderRadius: {
        '4xl': '2.5rem', // Super rounded for gummy UI
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'orb-rotate': 'orbRotate 20s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.1)' },
        },
        orbRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 140, 104, 0.3), 0 0 40px rgba(255, 140, 104, 0.1)',
        'card': '0 0 0 1px rgba(255, 255, 255, 0.02), 0 10px 40px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 0 0 1px rgba(255, 140, 104, 0.2), 0 20px 60px rgba(255, 140, 104, 0.15)',
      },
    },
  },
  plugins: [],
};
