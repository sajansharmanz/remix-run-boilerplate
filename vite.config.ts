import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  server: {
    host: true,
  },
  build: {
    cssMinify: process.env.NODE_ENV === "production",
    rollupOptions: {
      external: [/node:.*/],
    },
  },
});
