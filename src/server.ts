import express, { Request, Response } from 'express';
import { PORT } from './config';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from 'passport';
import pg from 'pg';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import morgan from 'morgan';
import axios from 'axios';

import './auth/passport';

import queryRoutes from './routes/queryRoutes';
import oauthRoutes from './routes/oauthRoutes';
import passkeyRoutes from './routes/passkeyRoutes';
import qgraphRoutes from './routes/qgraphRoutes';

dotenv.config();
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

const app = express();
const postgresSession = pgSession(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ROBOKOP API',
      version: '1.0.0',
      description: 'API documentation for ROBOKOP',
    },
    servers: [
      {
        url: `https://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsDoc(options);

app.use(express.json());
app.use(
  session({
    store: new postgresSession({
      pool: pgPool,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: false,
      httpOnly: true,
    },
  })
);

const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use('/api', qgraphRoutes);
app.use('/api/queries', queryRoutes);
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
  console.log(`Server running here: http://localhost:${PORT}`);
});
