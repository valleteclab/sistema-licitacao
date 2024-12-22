const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./routes/auth');
const fluxosRoutes = require('./routes/fluxos');
const processosRoutes = require('./routes/processos');

app.use('/api/auth', authRoutes);
app.use('/api/fluxos', fluxosRoutes);
app.use('/api/processos', processosRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
