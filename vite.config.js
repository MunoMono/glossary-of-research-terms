import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/glossary-of-research-terms/",
  server: { open: "/" },
  resolve: {
    alias: [{ find: /^~(.*)$/, replacement: "$1" }],
  },
});