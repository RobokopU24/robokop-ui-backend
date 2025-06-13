import { Request, Response, RequestHandler } from 'express';
import * as service from '../services/queryServices';

export const saveQuery: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqUser = req.user as { id: string | number } | undefined;
    const userId = (reqUser || {}).id as string;
    const { name, query } = req.body;
    const saved = await service.createSavedQuery(userId, name, query);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save query' });
  }
};

export const getQueries: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqUser = req.user as { id: string | number } | undefined;
    const userId = (reqUser || {}).id as string;
    const list = await service.getSavedQueries(userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch queries' });
  }
};

export const searchQueries: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const predicate = req.query.predicate;
    if (typeof predicate !== 'string') {
      res.status(400).json({ error: 'Invalid predicate parameter' });
      return;
    }
    const results = await service.findQueriesByPredicate(predicate);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to search queries' });
  }
};

export const deleteQuery: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqUser = req.user as { id: string | number } | undefined;
    const { id: userId } = reqUser || {};
    const queryId = req.params.id;
    const query = await service.getSavedQueryByIdAndReturnUserId(queryId);
    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }
    if (query.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this query' });
      return;
    }
    const deleted = await service.deleteSavedQuery(queryId);
    if (!deleted) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }
    res.json({ message: 'Query deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete query' });
  }
};
