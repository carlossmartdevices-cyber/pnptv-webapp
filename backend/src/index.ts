import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './env';
import authRoutes from './modules/auth/auth.routes';
import hangoutsRoutes from './modules/hangouts/hangouts.routes';
import videoramaRoutes from './modules/videorama/videorama.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/hangouts', hangoutsRoutes);
app.use('/videorama', videoramaRoutes);

app.listen(env.PORT, () => {
  console.log(`API running on :${env.PORT}`);
});
