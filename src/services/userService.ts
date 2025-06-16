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

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, name: string, profilePicture: string | null) {
  return prisma.user.create({
    data: { email, name, profilePicture },
  });
}
