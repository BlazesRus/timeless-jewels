// Modern Tailwind CSS v4 Configuration with ES Modules
import { defineConfig } from '@tailwindcss/vite';

/** @type {import('@tailwindcss/vite').Config} */
export default defineConfig({
  content: ['./src/**/*.{html,js,svelte,ts}', 'node_modules/@sveltejs/kit/**/*.{js,ts}'],
  theme: {
    extend: {
      // Modern responsive breakpoints with container queries
      screens: {
        '3xl': '1900px',
        '4xl': '2500px',
        // Container query breakpoints
        '@sm': { 'container-width': '640px' },
        '@md': { 'container-width': '768px' },
        '@lg': { 'container-width': '1024px' }
      },

      // Modern color system with CSS custom properties
      colors: {
        // Modern adaptive colors using CSS variables
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        hover: 'var(--color-hover)',
        focus: 'var(--color-focus)'
      },

      // Modern spacing with logical properties
      spacing: {
        0.5: '0.125rem',
        1.5: '0.375rem',
        2.5: '0.625rem',
        3.5: '0.875rem',
        18: '4.5rem',
        88: '22rem'
      },

      // Modern typography with improved readability
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'Fira Code', 'Cascadia Code', 'monospace']
      },

      // Modern animations with reduced motion support
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite'
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },

      // Modern container queries
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem'
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px'
        }
      }
    }
  },

  // Modern plugins and features
  plugins: [
    // Container queries plugin
    function ({ addUtilities, theme }) {
      const containerQueries = {
        '.container-query': {
          'container-type': 'inline-size'
        },
        '.container-query-size': {
          'container-type': 'size'
        }
      };
      addUtilities(containerQueries);
    },

    // Modern focus management
    function ({ addUtilities }) {
      const focusUtilities = {
        '.focus-modern': {
          '&:focus-visible': {
            outline: '2px solid var(--color-focus)',
            'outline-offset': '2px',
            'border-radius': '0.25rem'
          }
        }
      };
      addUtilities(focusUtilities);
    },

    // Modern reduced motion utilities
    function ({ addUtilities }) {
      const motionUtilities = {
        '@media (prefers-reduced-motion: reduce)': {
          '.motion-reduce-override': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important'
          }
        }
      };
      addUtilities(motionUtilities);
    }
  ],

  // Modern core plugins configuration
  corePlugins: {
    // Enable modern CSS features
    container: true,
    aspectRatio: true,
    scrollSnapType: true,
    scrollSnapAlign: true
  },

  // Modern experimental features
  experimental: {
    // Enable CSS-in-JS optimizations
    optimizeUniversalDefaults: true
  }
});
