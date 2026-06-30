import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'test/server-only.mock.ts'),
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
      all: true,
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'proxy.ts',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 74.59,
        branches: 74.44,
        functions: 71.73,
        lines: 74.65,
      },
      exclude: [
        '.next/**',
        '**/*.test.{ts,tsx}',
        'app/favicon.ico',
        'app/globals.css',
        'components/ui/**',
        'coverage/**',
        'drizzle/**',
        'lib/constants/**',
        'lib/interfaces/**',
        'lib/types.ts',
        'node_modules/**',
        'next-env.d.ts',
        'test/**',
        'vitest.config.ts',
        'vitest.setup.ts',
      ],
    },
  },
});
