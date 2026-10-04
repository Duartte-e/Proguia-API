const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const cursoRoutes = require('./routes/cursoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', mensagem: 'API Proguia rodando perfeitamente!' });
});

// Rotas da API
app.use('/api', usuarioRoutes);
app.use('/api', cursoRoutes);

// Trata rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ erro: 'Endpoint não encontrado.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📌 Teste de rota: http://localhost:${PORT}/health`);
});
