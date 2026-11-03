import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export const ENV_KEYS = [
  "GRAPHQL_ENDPOINT",
  "STAGE",
  "IS_SENTRY_ENABLED",
  "SBERT_ENDPOINT",
  "LRS_USERNAME",
  "LRS_PASSWORD",
  "LRS_ENDPOINT",
  "GOOGLE_CLIENT_ID",
  "CLIENT_ENDPOINT",
  "ACCESS_TOKEN",
] as const;

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), [...ENV_KEYS]);
  const env: Record<string, string> = { ...fileEnv };
  for (const key of ENV_KEYS) {
    if (process.env[key] !== undefined) {
      env[key] = process.env[key] as string;
    }
  }

  const define: Record<string, string> = {};
  for (const key of ENV_KEYS) {
    define[`process.env.${key}`] = JSON.stringify(env[key] ?? "");
  }

  return {
    plugins: [react(), tsconfigPaths()],
    base: "/admin/",
    publicDir: "static",
    server: {
      port: 3000,
    },
    build: {
      outDir: "public",
      emptyOutDir: true,
      sourcemap: false,
    },
    define,
    optimizeDeps: {
      include: ["recordrtc", "videojs-record", "danfojs"],
    },
  };
});
