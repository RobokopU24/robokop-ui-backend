import { Router } from "express";
import { saveQuery, getQueries, searchQueries } from "../controllers/queryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.post("/", saveQuery);
router.get("/", getQueries);
router.get("/search", searchQueries);

export default router;
