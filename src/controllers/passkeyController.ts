import { RequestHandler, Request, Response } from 'express';
import { getUserByIdWithWebauthn } from '../services/userService';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import {
  checkExistingPasskey,
  createPasskey,
  deletePasskey,
  findPasskey,
  findPasskeyById,
  findPasskeysByUserId,
  updateCounter,
} from '../services/webAuthCredentialService';
import {
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';

export const generateRegistrationOptionsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const { id: userId } = req.user as any;
    const user = await getUserByIdWithWebauthn(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const excludeCredentials: PublicKeyCredentialDescriptor[] = user.WebAuthnCredential.map(
      (cred) => ({
        id: Buffer.from(cred.credentialId, 'base64'),
        type: 'public-key',
        transports: cred.transports as AuthenticatorTransport[],
      })
    );

    const options = await generateRegistrationOptions({
      rpName: process.env.RP_NAME || 'ROBOKOP',
      rpID: process.env.RP_ID || 'localhost',
      userID: user.id,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      excludeCredentials,
    });
    req.session.webauthnChallenge = options.challenge;
    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
};

export const verifyRegistrationHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as any;
    const user = await getUserByIdWithWebauthn(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const registrationResponseBody = req.body as RegistrationResponseJSON;
    const verification = (await verifyRegistrationResponse({
      response: registrationResponseBody,
      expectedChallenge: req.session.webauthnChallenge || '',
      expectedOrigin: process.env.FRONTEND_URL || 'https://localhost:4000',
      expectedRPID: process.env.RP_ID || 'localhost',
    })) as VerifiedRegistrationResponse;

    if (verification.verified && verification.registrationInfo) {
      const credentialId = Buffer.from(verification.registrationInfo.credentialID).toString(
        'base64'
      );

      const existingPasskey = await checkExistingPasskey(credentialId);

      if (existingPasskey) {
        res.status(400).json({ error: 'This passkey is already registered' });
        return;
      }

      await createPasskey(
        credentialId,
        verification,
        user,
        registrationResponseBody.response.transports
      );
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
};

export const generateAuthenticationOptionsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || 'localhost',
      userVerification: 'preferred',
      allowCredentials: [],
    });
    req.session.webauthnChallenge = options.challenge;
    res.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
};

export const verifyAuthenticationHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as AuthenticationResponseJSON;

    if (!body.id || !body.response) {
      res.status(400).json({ error: 'Invalid authentication payload' });
      return;
    }

    const responseIdBase64 = Buffer.from(body.id, 'base64url').toString('base64');
    const passkey = await findPasskeyById(responseIdBase64);

    if (!passkey) {
      res.status(400).json({ error: 'Passkey not found' });
      return;
    }

    const verification = (await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: req.session.webauthnChallenge || '',
      expectedOrigin: process.env.FRONTEND_URL || 'https://localhost:4000',
      expectedRPID: process.env.RP_ID || 'localhost',
      authenticator: {
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'),
        credentialID: Buffer.from(passkey.credentialId, 'base64'),
        counter: passkey.counter,
        transports: Array.isArray(passkey.transports)
          ? (passkey.transports as AuthenticatorTransport[])
          : undefined,
      },
    })) as VerifiedAuthenticationResponse;

    if (verification.verified) {
      await updateCounter(passkey.id, verification.authenticationInfo.newCounter);

      const token = jwt.sign(
        { userId: passkey.user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      res.json({ verified: true, token });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
};

export const listPasskeysHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as any;
    const passkeys = await findPasskeysByUserId(userId);
    res.json(passkeys);
  } catch (error) {
    console.error('Error listing passkeys:', error);
    res.status(500).json({ error: 'Failed to list passkeys' });
  }
};

export const deletePasskeyHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as any;
    const passkey = await findPasskey(req.params.id);
    if (!passkey) {
      res.status(404).json({ error: 'Passkey not found' });
      return;
    }
    if (passkey.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this passkey' });
      return;
    }
    await deletePasskey(passkey.id);
    res.json({ message: 'Passkey deleted successfully' });
  } catch (error) {
    console.error('Error deleting passkey:', error);
    res.status(500).json({ error: 'Failed to delete passkey' });
  }
};
