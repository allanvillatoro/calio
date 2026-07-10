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
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'proxy.ts',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80.04,
        branches: 77.92,
        functions: 78.04,
        lines: 80.29,
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
