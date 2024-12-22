# Guia de Instalação e Configuração do XAMPP

## 1. Instalação do XAMPP

1. Baixe o XAMPP para Windows:
   - Acesse: https://www.apachefriends.org/download.html
   - Escolha a versão mais recente para Windows

2. Execute o instalador:
   - Execute como administrador
   - Instale em `C:\xampp`
   - Selecione os componentes:
     * Apache
     * MySQL
     * PHP
     * phpMyAdmin

## 2. Configuração do MySQL (MariaDB)

1. Inicie o XAMPP Control Panel
2. Inicie os serviços Apache e MySQL
3. Acesse o phpMyAdmin:
   - Abra o navegador
   - Acesse: http://localhost/phpmyadmin

4. Criar o banco de dados:
   - Clique em "Novo" no menu lateral
   - Nome do banco: sistema_licitacao
   - Charset: utf8mb4_unicode_ci
   - Clique em "Criar"

5. Importar o esquema do banco:
   - Selecione o banco sistema_licitacao
   - Clique em "Importar"
   - Escolha o arquivo: `backend/src/database/schema.sql`
   - Clique em "Executar"

## 3. Configuração do Node.js

1. Instale o Node.js:
   - Baixe em: https://nodejs.org/
   - Instale a versão LTS

2. Configure o backend:
   ```bash
   cd backend
   npm install
   ```

3. Configure o arquivo .env:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sistema_licitacao
   JWT_SECRET=seu_jwt_secret
   ```

4. Configure o frontend:
   ```bash
   cd frontend
   npm install
   ```

## 4. Configuração do Apache como Proxy Reverso

1. Habilite os módulos do Apache:
   - Abra `C:\xampp\apache\conf\httpd.conf`
   - Descomente as linhas:
     ```apache
     LoadModule proxy_module modules/mod_proxy.so
     LoadModule proxy_http_module modules/mod_proxy_http.so
     ```

2. Configure o Virtual Host:
   - Abra `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
   - Adicione:
   ```apache
   <VirtualHost *:80>
       ServerName localhost
       
       # Frontend
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
       
       # Backend API
       ProxyPass /api http://localhost:3001/api
       ProxyPassReverse /api http://localhost:3001/api
       
       # Configurações CORS
       Header set Access-Control-Allow-Origin "*"
       Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
       Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
   </VirtualHost>
   ```

3. Reinicie o Apache no XAMPP Control Panel

## 5. Executando o Sistema

1. Inicie os serviços no XAMPP:
   - Apache
   - MySQL

2. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Inicie o frontend:
   ```bash
   cd frontend
   npm start
   ```

## 6. Acessando o Sistema

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- phpMyAdmin: http://localhost/phpmyadmin

## 7. Manutenção

1. Backup do banco de dados:
   - Acesse o phpMyAdmin
   - Selecione o banco sistema_licitacao
   - Clique em "Exportar"
   - Escolha "Personalizado"
   - Selecione "Estrutura e dados"
   - Clique em "Executar"

2. Logs:
   - Apache: `C:\xampp\apache\logs`
   - MySQL: `C:\xampp\mysql\data\mysql_error.log`

3. Reiniciar serviços:
   - Use o XAMPP Control Panel
   - Botões "Stop" e "Start" para cada serviço

## 8. Segurança

1. Altere a senha do root do MySQL:
   - Acesse o phpMyAdmin
   - Vá em "Contas de utilizador"
   - Edite o usuário root
   - Defina uma senha forte

2. Configure o arquivo .env do backend com a nova senha

3. Restrinja o acesso ao phpMyAdmin:
   - Edite `C:\xampp\phpMyAdmin\config.inc.php`
   - Configure uma senha para o phpMyAdmin

## 9. Problemas Comuns

1. Portas em uso:
   - Verifique se as portas 80, 3000, 3001 e 3306 estão livres
   - Use o comando: `netstat -ano | findstr "PORTA"`

2. Erro de conexão com MySQL:
   - Verifique se o serviço está rodando
   - Confirme as credenciais no .env
   - Teste a conexão via phpMyAdmin

3. Erro no Apache:
   - Verifique os logs em `C:\xampp\apache\logs`
   - Confirme se todas as portas estão livres
   - Verifique a sintaxe dos arquivos de configuração
