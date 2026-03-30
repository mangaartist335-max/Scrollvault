import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0 (reachable via localhost + 127.0.0.1)
    port: 5181,
    strictPort: true, // fail loudly if the port is taken
    open: true, // optional: auto-open browser
  },
  preview: {
    host: true,
    port: 5181,
    strictPort: true,
  },
});

