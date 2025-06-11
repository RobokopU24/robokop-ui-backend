import { PrismaClient } from '@prisma/client';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types';

const prisma = new PrismaClient();

export async function checkExistingPasskey(credentialId: string) {
  return prisma.webAuthnCredential.findUnique({
    where: { credentialId },
  });
}

export async function createPasskey(
  credentialId: string,
  verification: VerifiedRegistrationResponse,
  user: { id: string },
  transports: AuthenticatorTransportFuture[] | undefined
) {
  return prisma.webAuthnCredential.create({
    data: {
      credentialId,
      publicKey: Buffer.from(verification.registrationInfo?.credentialPublicKey || '').toString(
        'base64'
      ),
      counter: verification.registrationInfo?.counter,
      userId: user.id,
      deviceType: verification.registrationInfo?.credentialDeviceType,
      transports,
      backedUp: verification.registrationInfo?.credentialBackedUp,
    },
  });
}

export async function findPasskeyById(credentialId: string) {
  return prisma.webAuthnCredential.findUnique({
    where: { credentialId },
    include: {
      user: {
        include: {
          _count: {
            select: { WebAuthnCredential: true },
          },
        },
      },
    },
  });
}

export async function updateCounter(id: string, newCounter: number) {
  return prisma.webAuthnCredential.update({
    where: { id },
    data: { counter: newCounter },
  });
}

export async function findPasskeysByUserId(userId: string) {
  return prisma.webAuthnCredential.findMany({
    where: { userId },
    select: {
      id: true,
      deviceType: true,
      createdAt: true,
    },
  });
}

export const findPasskey = async (id: string) => {
  return prisma.webAuthnCredential.findUnique({
    where: { id: id },
  });
};

export async function deletePasskey(id: string) {
  return prisma.webAuthnCredential.delete({
    where: { id: id },
  });
}
