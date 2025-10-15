import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';

import httpRoutes from './routes/httpRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/api', httpRoutes);
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
