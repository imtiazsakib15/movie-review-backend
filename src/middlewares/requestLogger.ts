import type { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");
const accessLogPath = path.join(logDir, "access.log");

const ensureLogDir = async () => {
  await fs.mkdir(logDir, { recursive: true });
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", async () => {
    try {
      const endedAt = process.hrtime.bigint();

      const durationMs = Number(endedAt - startedAt) / 1_000_000;

      const timestamp = new Date().toISOString();

      const ip = req.ip || req.socket.remoteAddress || "unknown";

      const userAgent = req.get("user-agent") || "unknown";

      const userId = req.user?.id ?? "-";

      const logEntry = {
        timestamp,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: `${durationMs.toFixed(2)} ms`,
        ip,
        userId,
        "user-agent": userAgent,
      };

      console.log(logEntry);

      await ensureLogDir();
      await fs.appendFile(
        accessLogPath,
        `${JSON.stringify(logEntry)}\n`,
        "utf-8",
      );
    } catch (error) {
      console.error("Failed to write access log:", error);
    }
  });

  next();
};
