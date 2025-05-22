import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await userService.registerUser(email, password);
    res.status(201).json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { token, user } = await userService.authenticateUser(email, password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const user = await userService.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
