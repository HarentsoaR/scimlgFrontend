import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: '640px',  // Small devices (phones)
      md: '768px',  // Medium devices (tablets)
      lg: '1024px', // Large devices (desktops)
      xl: '1280px', // Extra large devices (large desktops)
      '2xl': '1536px', // 2X extra large devices
    },
    extend: {
      colors: {
        primary: '#5483BF', // Example primary color
        secondary: '#3C5FA6', // Example secondary color
        accent: '#3F4C73', // Example accent color
        background: '#F2F2F2', // Light background color
        foreground: '#1A3073', // Dark foreground color
      },
    },
  },
  plugins: [],
};
export default config;
