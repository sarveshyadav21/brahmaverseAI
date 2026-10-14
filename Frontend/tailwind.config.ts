import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF5A00',
          hover: '#E04E00',
          soft: '#FFF0EB',
          border: '#FFD3C2',
        },
        fastor: {
          blue: '#53B9EA',
          salmon: '#FF8A65',
          dark: '#1C1C1E',
          muted: '#8E8E93',
          bg: '#F8F9FA',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Mulish', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        subtle: '0 2px 10px rgba(0, 0, 0, 0.04)',
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.08)',
        phone: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
