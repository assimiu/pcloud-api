import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', router);

// Rota padrão para o Vercel
app.get('/', (req, res) => {
  res.json({ message: 'API no ar!' });
});

// Error handler (crie em ./utils/errorHandler.js)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export para o Vercel
export default app;