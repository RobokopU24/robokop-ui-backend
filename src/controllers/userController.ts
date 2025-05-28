import { Request, RequestHandler, Response } from 'express';
import * as userService from '../services/userService';
// import * as webAuthCredentialService from '../services/webAuthCredentialService';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

declare module 'express-session' {
  interface SessionData {
    webauthnChallenge?: string;
    webauthnUserId?: string;
  }
}

// export const generateRegistrationOptionsHandler: RequestHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   // const { email } = req.body;
//   // const { user } = await userService.authenticateUser(email, password);
//   const { id } = req.user as any;
//   const user = await userService.getUserById(id);
//   if (!user) {
//     res.status(401).json({ error: 'Invalid credentials' });
//     return;
//   }
//   const options = await generateRegistrationOptions({
//     rpID: process.env.RP_ID || 'localhost',
//     rpName: 'ROBOKOP',
//     userName: user.email,
//     userID: new TextEncoder().encode(user.id.toString()),
//   });
//   req.session.webauthnChallenge = options.challenge;
//   req.session.webauthnUserId = user.id;
//   res.json(options);
// };

// export const verifyRegistrationHandler: RequestHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const challenge = req.session.webauthnChallenge;
//   const userId = req.session.webauthnUserId;
//   if (!challenge || !userId) {
//     res.status(400).json({ error: 'No registration in progress' });
//     return;
//   }
//   const verification = await verifyRegistrationResponse({
//     response: req.body,
//     expectedChallenge: challenge,
//     expectedOrigin: 'http://localhost:3000',
//     expectedRPID: process.env.RP_ID || 'localhost',
//   });

//   delete req.session.webauthnChallenge;
//   delete req.session.webauthnUserId;

//   if (verification.verified) {
//     const registerCredentials = await webAuthCredentialService.registerWebAuthCredential(
//       userId,
//       verification.registrationInfo?.credential.id,
//       verification.registrationInfo?.credential.publicKey,
//       verification.registrationInfo?.credential.counter,
//       verification.registrationInfo?.credentialBackedUp,
//       verification.registrationInfo?.credentialDeviceType,
//       req.body.transports
//     );
//     res
//       .status(200)
//       .json({ message: 'Registration successful', registerCredentials: registerCredentials.id });
//   } else {
//     res.status(400).json({ error: 'Invalid registration response' });
//   }
// };

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
