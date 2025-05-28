import express, { Request, Response } from 'express';
import { PORT } from './config';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';

import './auth/passport';

import queryRoutes from './routes/queryRoutes';
import userRoutes from './routes/userRoutes';
import oauthRoutes from './routes/oauthRoutes';
import passkeyRoutes from './routes/passkeyRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' },
  })
);

// CORS middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/queries', queryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/passkeys', passkeyRoutes);

app.get('/health', (req: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    res.status(200).send(healthCheck);
  } catch (error) {
    healthCheck.message = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).send(healthCheck);
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
