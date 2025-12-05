/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Telegram theme colors
        'tg-bg': 'var(--tg-theme-bg-color, #1C1C1E)',
        'tg-text': 'var(--tg-theme-text-color, #FFFFFF)',
        'tg-hint': 'var(--tg-theme-hint-color, #8E8E93)',
        'tg-link': 'var(--tg-theme-link-color, #007AFF)',
        'tg-button': 'var(--tg-theme-button-color, #3390EC)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #FFFFFF)',
        'tg-secondary-bg': 'var(--tg-theme-secondary-bg-color, #2C2C2E)',
      },
      animation: {
        'float': 'float 30s infinite ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}

