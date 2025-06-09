import { Router } from 'express';
import { saveQuery, getQueries, searchQueries, deleteQuery } from '../controllers/queryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/', saveQuery);
router.get('/', getQueries);
router.get('/search', searchQueries);
router.delete('/:id', deleteQuery);

export default router;
