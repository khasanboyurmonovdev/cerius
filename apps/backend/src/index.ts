import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(
    `[cerius] backend listening on http://localhost:${String(config.port)} (${config.env})`,
  );
});

const shutdown = (signal: string): void => {
  console.log(`[cerius] ${signal} received, shutting down`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});
