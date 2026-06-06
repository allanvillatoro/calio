import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        '.next/**',
        'coverage/**',
        'drizzle/**',
        'node_modules/**',
        'next-env.d.ts',
        'vitest.config.ts',
        'vitest.setup.ts',
      ],
    },
  },
});
