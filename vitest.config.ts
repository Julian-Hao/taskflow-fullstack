import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    // 服务端测试统一跑在内存数据库上，互不污染
    env: {
      NODE_ENV: 'test',
      DB_FILE: ':memory:',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
      exclude: ['**/*.test.*', '**/*.d.ts', 'src/main.tsx'],
    },
  },
});
