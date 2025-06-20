
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./public/manifest.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Add component tagger only in development
  if (mode === 'development') {
    plugins.push(componentTagger());
  }
  
  // Add CRX plugin for extension mode
  if (mode === 'extension') {
    plugins.push(crx({ manifest }) as any);
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
