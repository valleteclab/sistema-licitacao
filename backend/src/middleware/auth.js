const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Verificar se o token está presente no header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
        }

        try {
            // Verificar e decodificar o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token inválido' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
