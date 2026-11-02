import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy for /api and /c so the PWA can talk to the FastAPI backend
// on http://127.0.0.1:8000 without CORS issues during local development.
// The app itself POSTs to the absolute API base (see src/lib/api.js),
// which defaults to http://127.0.0.1:8000 per the MVP spec.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/c": "http://127.0.0.1:8000",
    },
  },
});
