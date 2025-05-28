import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../services/userService';

export function oauthCallback(req: Request, res: Response) {
  const user = req.user as any;
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

  jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    const user = await getUserById((decoded as any).userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'Token is valid', user: { id: user.id, email: user.email } });
  });
};
