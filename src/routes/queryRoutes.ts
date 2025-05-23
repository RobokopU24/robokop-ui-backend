import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { saveQuery, getQueries, searchQueries } from '../controllers/queryController';

const router = Router();

router.use(authMiddleware);

router.post('/', saveQuery);
router.get('/', getQueries);
router.get('/search', searchQueries);

export default router;
