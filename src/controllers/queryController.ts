import { Request, Response, RequestHandler } from "express";
import * as service from "../services/queryServices";

export const saveQuery: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id as number;
    const { name, query } = req.body;
    const saved = await service.createSavedQuery(userId, name, query);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save query" });
  }
};

export const getQueries: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id as number;
    const list = await service.getSavedQueries(userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch queries" });
  }
};

export const searchQueries: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const predicate = req.query.predicate;
    if (typeof predicate !== "string") {
      res.status(400).json({ error: "Invalid predicate parameter" });
      return;
    }
    const results = await service.findQueriesByPredicate(predicate);
    res.json(results);
  } catch {
    res.status(500).json({ error: "Failed to search queries" });
  }
};
