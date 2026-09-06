import { Router } from "express";
import { ragController } from "./rag.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/ingest-all-media", ragController.ingestAllMedia);

router.post("/query", ragController.mediaQuery);

export default router;
