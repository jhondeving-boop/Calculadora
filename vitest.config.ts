import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib'),
      '$components': path.resolve('./src/lib/components'),
      '$stores': path.resolve('./src/lib/stores'),
      '$schemas': path.resolve('./src/lib/schemas'),
      '$services': path.resolve('./src/lib/services'),
      '$utils': path.resolve('./src/lib/utils'),
      '$hooks': path.resolve('./src/lib/hooks'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});