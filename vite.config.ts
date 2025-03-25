import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // Use "localhost" instead of "::" to avoid IPv6 issues
    port: 8080,
    hmr: {
      protocol: "ws", // Use WebSocket protocol
      host: "localhost", // Ensure HMR connects to localhost
      port: 8080, // Match the server port
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));