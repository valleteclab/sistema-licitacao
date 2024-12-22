module.exports = {
  apps: [
    {
      name: 'sistema-licitacao-api',
      script: 'src/server.js',
      cwd: '/home/sistema-licitacao/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_USER: 'seu_usuario',
        DB_PASSWORD: 'sua_senha',
        DB_NAME: 'sistema_licitacao',
        JWT_SECRET: 'seu_jwt_secret'
      }
    },
    {
      name: 'sistema-licitacao-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/sistema-licitacao/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        REACT_APP_API_URL: 'https://api.seu-dominio.com'
      }
    }
  ],

  deploy: {
    production: {
      user: 'cyberpanel',
      host: 'seu-ip-ou-dominio',
      ref: 'origin/main',
      repo: 'seu-repositorio-git',
      path: '/home/sistema-licitacao',
      'post-deploy': 'cd backend && npm install && cd ../frontend && npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
