import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = env.VITE_DEV_API_TARGET || "http://localhost:8080";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true
        }
      }
    },
    test: {
      environment: "jsdom",
      exclude: ["e2e/**", "node_modules/**", "dist/**"],
      globals: true,
      setupFiles: "./vitest.setup.ts"
    }
  };
});
