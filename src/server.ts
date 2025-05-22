import express, { Request, Response } from 'express';
import { PORT } from './config';

import queryRoutes from './routes/queryRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.json());

app.use('/api/queries', queryRoutes);
app.use('/api/users', userRoutes);

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
