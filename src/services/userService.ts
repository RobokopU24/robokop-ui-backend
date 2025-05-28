import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, SALT_ROUNDS } from '../config';

const prisma = new PrismaClient();

export async function registerUser(email: string, password: string) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  return { token, user };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getUserByIdWithWebauthn(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { WebAuthnCredential: true },
  });
}

export async function updateUserChallenge(userId: string, challenge: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: challenge },
  });
}
