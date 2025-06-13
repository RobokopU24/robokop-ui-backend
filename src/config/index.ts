import dotenv from 'dotenv';
dotenv.config();
export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
export const JWT_TOKEN_EXPIRES_IN = process.env.JWT_TOKEN_EXPIRES_IN || '30d';

export const RP_NAME = process.env.RP_NAME || 'ROBOKOP Test';
export const RP_ID = process.env.RP_ID || 'localhost';
export const RP_ORIGIN = process.env.RP_ORIGIN || 'https://localhost:3000';
