import { Router } from "express";
import { ragController } from "./rag.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.use(authenticate);

router.post(
  "/ingest-all-media",
  authorize("ADMIN"),
  ragController.ingestAllMedia,
);

router.post("/query", ragController.mediaQuery);

router.get("/stats", ragController.getStats);

export default router;
