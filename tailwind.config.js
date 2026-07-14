/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12151B",
        "ink-soft": "#1B2029",
        paper: "#EDEAE2",
        "paper-dim": "#DFDBCE",
        teal: "#3F8C7A",
        "teal-dark": "#2E6B5D",
        amber: "#D9A441",
        rust: "#B4552F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "2px",
      },
    },
  },
  plugins: [],
};
