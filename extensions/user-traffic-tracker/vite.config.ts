import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/main.tsx",
      output: {
        entryFileNames: "widget.bundle.js",
        assetFileNames: "widget.css",
      },
    },
  },
  root: ".",
});
