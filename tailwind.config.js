/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-bg': '#F2F2F7',
        'ios-text': '#1C1C1E',
        'ios-gray': '#8E8E93',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-gold': '#FFD700',
        'ios-silver': '#C0C0C0',
        'ios-bronze': '#CD7F32',
      },
      fontFamily: {
        'ios': ['-apple-system', 'BlinkMacSystemFont', "'SF Pro Text'", 'sans-serif'],
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'ios-md': '0 4px 12px rgba(0,0,0,0.1)',
        'ios-lg': '0 8px 24px rgba(0,0,0,0.12)',
        'ios-xl': '0 12px 40px rgba(0,0,0,0.15)',
      },
      backdropBlur: {
        'ios': '20px',
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
      },
    },
  },
  plugins: [],
}
