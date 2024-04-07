/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: { postcss: { plugins: [] } },
  test: {
    include: ["**/*.test.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup/setup.ts",
  },
});
