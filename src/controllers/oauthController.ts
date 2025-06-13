import e, { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByEmail, getUserByIdWithWebauthnCount, createUser } from '../services/userService';

import { Resend } from 'resend';
import MagicLink from '../emails/MagicLink';
import { render, pretty } from '@react-email/render';
import NewUser from '../emails/NewUser';

interface JwtPayload {
  userId: string;
}

const resend = new Resend(process.env.RESEND_API_KEY!);

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

export const sendMagicLink: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  const email = req.body.email;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }
  const user = await getUserByEmail(email);

  // If the user does not exist, send a activate account email
  if (!user) {
    const newUserEmailToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
    const html = await pretty(
      await render(
        NewUser({
          link: `${process.env.FRONTEND_URL}/activate-user?token=${newUserEmailToken}`,
          email,
        })
      )
    );
    try {
      const resendResponse = await resend.emails.send({
        from: 'Amrutesh <register@amrutesh.me>',
        to: email,
        subject: 'Activate your account',
        html,
      });
      console.log('New user email sent:', resendResponse);
      if (resendResponse.error === null) {
        res.status(200).json({ message: 'Account activation link sent successfully to ' + email });
      } else {
        res.status(500).json({ error: 'Failed to send new user email' });
      }
    } catch (error) {
      console.error('Error sending new user email:', error);
      res.status(500).json({ error: 'Failed to send new user email' });
    }

    // If the user exists, send a magic link email
  } else {
    //TODO: Configure expiry time for the magic link
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    const html = await pretty(
      await render(
        MagicLink({ link: `${process.env.FRONTEND_URL}/oauth-callback?token=${token}`, email })
      )
    );

    // res.send(html);
    try {
      const resendResponse = await resend.emails.send({
        from: 'Amrutesh <login@amrutesh.me>',
        to: email,
        subject: 'Your Magic Link',
        html,
      });
      console.log('Magic link email sent:', resendResponse);
      if (resendResponse.error === null) {
        res.status(200).json({ message: 'Login link sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send login link email' });
      }
    } catch (error) {
      console.error('Error sending login link email:', error);
      res.status(500).json({ error: 'Failed to send login link email' });
    }
  }
};

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

export const activateUserTokenHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  // Verify the token, get the email from it and also expiry time and send it back to the client
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string; exp: number };
    if (typeof decoded !== 'object' || decoded === null || !('email' in decoded)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { email, exp } = decoded;

    // Check if the user already exists
    const user = await getUserByEmail(email);
    if (user) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    res.status(200).json({ email, exp });
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid token' });
  }
};

export const activateNewUserHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: 'Email and name are required' });
    return;
  }
  try {
    const newUser = await createUser(email, name, null);
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });
    res.status(201).json({
      message: 'User created successfully',
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};
