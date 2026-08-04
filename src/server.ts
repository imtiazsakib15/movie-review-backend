import { Server } from "http";
import app from "./app";
import {env} from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";

let server: Server;

const main = async () => {
  try {
    await connectDatabase();
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

main();
