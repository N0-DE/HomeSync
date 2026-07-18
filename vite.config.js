import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — no special setup needed, kept minimal on purpose
// so both devs can run `npm run dev` with zero friction.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
