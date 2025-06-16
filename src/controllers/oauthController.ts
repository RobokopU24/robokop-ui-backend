import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByIdWithWebauthnCount } from '../services/userService';

interface JwtPayload {
  userId: string;
}

export function oauthCallback(req: Request, res: Response): void {
  const user = req.user as { id: string | number } | undefined;
  if (!user?.id) {
    res.status(400).json({ error: 'User information is missing or invalid' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
}

export const validateToken: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.body.token;
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (typeof decoded !== 'object' || decoded === null || !('userId' in decoded)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { userId } = decoded as JwtPayload;

    const user = await getUserByIdWithWebauthnCount(userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Token is valid', user });
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid token' });
  }
};

export const logout: RequestHandler = (req: Request, res: Response): void => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
