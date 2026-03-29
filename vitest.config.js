import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.js'],
    exclude: ['test/test.js'],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/config.js',
        'src/quota-service.js',
        'src/screenshot-timeline.js',
        'src/supervisor.js',
        'src/session-stats.js',
        'src/utils/hash.js',
        'src/utils/network.js',
        'src/utils/telegram.js',
      ],
      exclude: ['src/server.js'],
    },
  },
});
