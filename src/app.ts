import express from "express";
import cors from "cors";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import notFound from "./middlewares/notFound";
import helmet from "helmet";
import { env } from "./config/env";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ success: true, message: "OK", uptime: process.uptime() });
});
app.use(notFound);
app.use(globalErrorHandler);

export default app;
