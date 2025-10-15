import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';
import compression from 'compression';
// import helmet from 'helmet';

import httpRoutes from './routes/httpRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
// app.use(helmet());

// Compression middleware for better performance
app.use(compression());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache static files for 7 days (increased from 1 day for better performance)
app.use(
  '/static',
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    },
  })
);

app.use('/api', httpRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
