const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Listar todos os processos
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [processos] = await connection.execute(`
            SELECT p.*, f.titulo as fluxo_titulo 
            FROM processos p 
            LEFT JOIN fluxos f ON p.fluxo_id = f.id 
            ORDER BY p.created_at DESC
        `);
        connection.release();
        res.json(processos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo processo
router.post('/', async (req, res) => {
    try {
        const { titulo, descricao, fluxo_id, documentos } = req.body;
        const usuario_id = req.user.id;
        const id = uuidv4();
        
        const connection = await pool.getConnection();
        
        // Verificar se o fluxo existe
        const [fluxo] = await connection.execute(
            'SELECT id FROM fluxos WHERE id = ?',
            [fluxo_id]
        );
        
        if (fluxo.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Fluxo não encontrado' });
        }
        
        await connection.execute(
            `INSERT INTO processos 
            (id, titulo, descricao, fluxo_id, documentos, status, etapa_atual, usuario_id) 
            VALUES (?, ?, ?, ?, ?, 'em_andamento', 1, ?)`,
            [id, titulo, descricao, fluxo_id, documentos, usuario_id]
        );
        
        const [novoProcesso] = await connection.execute(
            'SELECT * FROM processos WHERE id = ?',
            [id]
        );
        
        // Registrar primeira etapa no histórico
        const historico_id = uuidv4();
        await connection.execute(
            `INSERT INTO historico_processos 
            (id, processo_id, etapa, observacao, usuario_id) 
            VALUES (?, ?, 1, 'Processo iniciado', ?)`,
            [historico_id, id, usuario_id]
        );
        
        connection.release();
        res.status(201).json(novoProcesso[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar processo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, status, etapa_atual, documentos } = req.body;
        
        const connection = await pool.getConnection();
        await connection.execute(
            `UPDATE processos 
             SET titulo = ?, descricao = ?, status = ?, etapa_atual = ?, documentos = ?
             WHERE id = ?`,
            [titulo, descricao, status, etapa_atual, documentos, id]
        );
        
        const [processoAtualizado] = await connection.execute(
            'SELECT * FROM processos WHERE id = ?',
            [id]
        );
        
        connection.release();
        
        if (processoAtualizado.length === 0) {
            return res.status(404).json({ error: 'Processo não encontrado' });
        }
        
        res.json(processoAtualizado[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Avançar etapa do processo
router.post('/:id/avancar-etapa', async (req, res) => {
    try {
        const { id } = req.params;
        const { observacao } = req.body;
        const usuario_id = req.user.id;
        
        const connection = await pool.getConnection();
        
        // Buscar processo atual
        const [processo] = await connection.execute(
            'SELECT * FROM processos WHERE id = ?',
            [id]
        );
        
        if (processo.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Processo não encontrado' });
        }
        
        // Buscar fluxo para verificar número máximo de etapas
        const [fluxo] = await connection.execute(
            'SELECT etapas FROM fluxos WHERE id = ?',
            [processo[0].fluxo_id]
        );
        
        const etapas = fluxo[0].etapas.split(',').length;
        const novaEtapa = processo[0].etapa_atual + 1;
        
        // Verificar se é a última etapa
        const novoStatus = novaEtapa > etapas ? 'concluido' : 'em_andamento';
        
        // Atualizar processo
        await connection.execute(
            `UPDATE processos 
             SET etapa_atual = ?, status = ?
             WHERE id = ?`,
            [novaEtapa, novoStatus, id]
        );
        
        // Registrar no histórico
        const historico_id = uuidv4();
        await connection.execute(
            `INSERT INTO historico_processos 
            (id, processo_id, etapa, observacao, usuario_id) 
            VALUES (?, ?, ?, ?, ?)`,
            [historico_id, id, processo[0].etapa_atual, observacao, usuario_id]
        );
        
        const [processoAtualizado] = await connection.execute(
            'SELECT * FROM processos WHERE id = ?',
            [id]
        );
        
        connection.release();
        res.json(processoAtualizado[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar histórico do processo
router.get('/:id/historico', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [historico] = await connection.execute(
            `SELECT h.*, u.email as usuario_email 
             FROM historico_processos h
             LEFT JOIN usuarios u ON h.usuario_id = u.id
             WHERE h.processo_id = ?
             ORDER BY h.created_at ASC`,
            [id]
        );
        
        connection.release();
        res.json(historico);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
