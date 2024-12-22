const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Listar todos os fluxos
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [fluxos] = await connection.execute(
            'SELECT * FROM fluxos ORDER BY created_at DESC'
        );
        connection.release();
        res.json(fluxos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo fluxo
router.post('/', async (req, res) => {
    try {
        const { titulo, descricao, etapas } = req.body;
        const usuario_id = req.user.id;
        const id = uuidv4();
        
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO fluxos (id, titulo, descricao, etapas, status, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
            [id, titulo, descricao, etapas, 'ativo', usuario_id]
        );
        
        const [novoFluxo] = await connection.execute(
            'SELECT * FROM fluxos WHERE id = ?',
            [id]
        );
        
        connection.release();
        res.status(201).json(novoFluxo[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar fluxo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, etapas, status } = req.body;
        
        const connection = await pool.getConnection();
        await connection.execute(
            `UPDATE fluxos 
             SET titulo = ?, descricao = ?, etapas = ?, status = ?
             WHERE id = ?`,
            [titulo, descricao, etapas, status, id]
        );
        
        const [fluxoAtualizado] = await connection.execute(
            'SELECT * FROM fluxos WHERE id = ?',
            [id]
        );
        
        connection.release();
        
        if (fluxoAtualizado.length === 0) {
            return res.status(404).json({ error: 'Fluxo não encontrado' });
        }
        
        res.json(fluxoAtualizado[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar fluxo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        
        // Verificar se existem processos vinculados
        const [processos] = await connection.execute(
            'SELECT id FROM processos WHERE fluxo_id = ?',
            [id]
        );
        
        if (processos.length > 0) {
            connection.release();
            return res.status(400).json({ 
                error: 'Não é possível excluir o fluxo pois existem processos vinculados' 
            });
        }
        
        await connection.execute(
            'DELETE FROM fluxos WHERE id = ?',
            [id]
        );
        
        connection.release();
        res.json({ message: 'Fluxo deletado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar fluxo por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [fluxo] = await connection.execute(
            'SELECT * FROM fluxos WHERE id = ?',
            [id]
        );
        
        connection.release();
        
        if (fluxo.length === 0) {
            return res.status(404).json({ error: 'Fluxo não encontrado' });
        }
        
        res.json(fluxo[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
