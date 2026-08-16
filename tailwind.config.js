/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#006b5f",
        "primary-container": "#2dd4bf",
        "primary-fixed": "#62fae3",
        "primary-fixed-dim": "#3cddc7",
        "on-primary": "#ffffff",
        "on-primary-container": "#00574d",
        "on-primary-fixed": "#00201c",
        
        "secondary": "#55615f",
        "secondary-container": "#d8e5e2",
        "secondary-fixed": "#d8e5e2",
        "secondary-fixed-dim": "#bcc9c6",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5b6765",
        
        "tertiary": "#944a00",
        "tertiary-container": "#ffab6d",
        "tertiary-fixed": "#ffdcc5",
        "tertiary-fixed-dim": "#ffb783",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#7a3c00",
        
        "background": "#f8f9ff",
        "on-background": "#0d1c2e",
        
        "surface": "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#ccdbf3",
        "surface-variant": "#d5e3fc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d5e3fc",
        
        "on-surface": "#0d1c2e",
        "on-surface-variant": "#3c4a46",
        "inverse-surface": "#233144",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#3cddc7",
        
        "outline": "#6b7a76",
        "outline-variant": "#bacac5",
        "surface-tint": "#006b5f",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "sm": "0.25rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
      spacing: {
        "base": "4px",
        "xs": "8px",
        "sm": "12px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "margin-mobile": "20px",
        "gutter-mobile": "12px"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        headline: ["'Hanken Grotesk'", "'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Hanken Grotesk'", "sans-serif"],
      },
      boxShadow: {
        "ambient": "0 4px 20px 0 rgba(0, 107, 95, 0.06)",
        "ambient-lg": "0 8px 30px 0 rgba(0, 107, 95, 0.12)",
        "soft-card": "0 2px 12px 0 rgba(13, 28, 46, 0.04)",
      }
    },
  },
  plugins: [],
}
