/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222.2 84% 4.9%)",
        foreground: "hsl(210 40% 98%)",
        card: "hsl(222.2 84% 4.9%)",
        "card-foreground": "hsl(210 40% 98%)",
        popover: "hsl(222.2 84% 4.9%)",
        "popover-foreground": "hsl(210 40% 98%)",
        primary: "hsl(210 40% 98%)",
        "primary-foreground": "hsl(222.2 47.4% 11.2%)",
        secondary: "hsl(217.2 32.6% 17.5%)",
        "secondary-foreground": "hsl(210 40% 98%)",
        muted: "hsl(217.2 32.6% 17.5%)",
        "muted-foreground": "hsl(215 20.2% 65.1%)",
        accent: "hsl(217.2 32.6% 17.5%)",
        "accent-foreground": "hsl(210 40% 98%)",
        destructive: "hsl(0 62.8% 30.6%)",
        "destructive-foreground": "hsl(210 40% 98%)",
        border: "hsl(217.2 32.6% 17.5%)",
        input: "hsl(217.2 32.6% 17.5%)",
        ring: "hsl(212.7 26.8% 83.9%)",
        
        // Custom branding
        brand: {
          dark: "#0a192f",
          blue: "#112240",
          cyan: "#64ffda",
          slate: "#8892b0",
          light: "#e6f1ff",
        },
        risk: {
          low: "#10b981",    // Green
          medium: "#f59e0b", // Amber
          high: "#ef4444",   // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
