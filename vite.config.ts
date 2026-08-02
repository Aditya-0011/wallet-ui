import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /node_modules\/(react|react-dom)/,
              },
              {
                name: "tanstack-vendor",
                test: /node_modules\/@tanstack/,
              },
              {
                name: "base-ui",
                test: /node_modules\/@base-ui/,
              },
              {
                name: "lucide-react",
                test: /node_modules\/lucide-react/,
              },
              {
                name: "luxon",
                test: /node_modules\/luxon/,
              },
              {
                name: "react-router",
                test: /node_modules\/react-router/,
              },
              {
                name: "zod",
                test: /node_modules\/zod/,
              },
            ],
          },
        },
      },
    },
    server: {
      port: isDev ? 5175 : 5173,
    },
  };
});
