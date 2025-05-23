import dotenv from 'dotenv';
dotenv.config();
export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';
