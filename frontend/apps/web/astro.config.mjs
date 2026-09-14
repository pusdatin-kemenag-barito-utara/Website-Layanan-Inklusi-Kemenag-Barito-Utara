import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { createLogger } from "vite";

const customLogger = createLogger();
const originalWarn = customLogger.warn;
customLogger.warn = (msg, options) => {
  if (
    msg.includes("vite:react-babel") ||
    msg.includes("optimizeDeps.esbuildOptions") ||
    msg.includes("Rolldown")
  ) {
    return;
  }
  originalWarn(msg, options);
};

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react()],
  server: {
    port: Number(process.env.PORT || 3000),
    host: true,
  },
  vite: {
    customLogger,
    ssr: {
      noExternal: ["@inklusi/ui"],
    },
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
        },
      },
    },
  },
});


