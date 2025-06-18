/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        // or you can rename 'sans' to 'poppins' if you like
      },
      colors: {
        // Core colors for your design
        primary: "#3B82F6",
        "primary-dark": "#2563EB",
        secondary: "#F43F5E",
        "secondary-dark": "#E11D48",
        tertiary: "#10B981",
        // A custom color for glass elements (if needed)
        glass: "rgba(255, 255, 255, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        // Custom shadow for glass cards
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        // Custom border radius for glass elements
        glass: "15px",
      },
      keyframes: {
        // Floating animation for cards or other elements
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
