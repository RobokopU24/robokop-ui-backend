import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getUserByIdWithWebauthn(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { WebAuthnCredential: true },
  });
}

export async function getUserByIdWithWebauthnCount(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { WebAuthnCredential: true },
      },
    },
  });
}
