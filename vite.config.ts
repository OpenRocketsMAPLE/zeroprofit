import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Single config used by both `vite build`/`vite dev` and `vitest`.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
