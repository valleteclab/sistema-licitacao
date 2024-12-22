const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Rota de registro
router.post('/register', async (req, res) => {
    try {
        const { email, password, tipo } = req.body;
        const connection = await pool.getConnection();
        
        // Verificar se o usuário já existe
        const [existingUser] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Inserir usuário
        const userId = uuidv4();
        await connection.execute(
            'INSERT INTO usuarios (id, email, password, tipo) VALUES (?, ?, ?, ?)',
            [userId, email, hashedPassword, tipo]
        );
        
        connection.release();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await pool.getConnection();
        
        // Buscar usuário
        const [users] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        
        connection.release();
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const usuario = users[0];
        
        // Verificar senha
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { id: usuario.id, tipo: usuario.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
