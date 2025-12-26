/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#8B5CF6',
          'primary-light': '#A78BFA',
          'primary-dark': '#7C3AED',
          secondary: '#06B6D4',
          'secondary-light': '#22D3EE',
          'secondary-dark': '#0891B2',
          tertiary: '#EC4899',
          'tertiary-light': '#F472B6',
          'tertiary-dark': '#DB2777',
        },
        
        // Semantic - Light mode
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          dark: '#0A0A0F',
          'dark-secondary': '#12121A',
        },
        surface: {
          DEFAULT: '#F1F5F9',
          elevated: '#FFFFFF',
          dark: '#1A1A24',
          'elevated-dark': '#22222E',
        },
        primary: {
          DEFAULT: '#0F172A',
          dark: '#F8FAFC',
        },
        secondary: {
          DEFAULT: '#64748B',
          dark: '#94A3B8',
        },
        tertiary: {
          DEFAULT: '#94A3B8',
          dark: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
          dark: '#2A2A38',
          'subtle-dark': '#1E1E28',
        },
        
        // Card backgrounds
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1A1A24',
        },
        
        // Input backgrounds
        input: {
          DEFAULT: '#F1F5F9',
          dark: '#1E1E28',
        },
        
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        live: '#EF4444',
      },
      
      // Extended spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border radius
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      
      // Font sizes
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      
      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Box shadow for glow effects
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
      },
      
      fontFamily: {
        sans: ['System'],
      }
    },
  },
  plugins: [],
}
