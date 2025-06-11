import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "./src/main.tsx",
      output: {
        entryFileNames: "widget.react.bundle.js",
        assetFileNames: "widget.tailwindcss.bundle.css",
      },
    },
  },
  root: ".",
});
