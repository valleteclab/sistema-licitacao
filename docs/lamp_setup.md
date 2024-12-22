# Guia de Instalação LAMP Stack no Ubuntu

## 1. Instalação do LAMP Stack

```bash
# Atualizar o sistema
sudo apt update
sudo apt upgrade -y

# Instalar Apache
sudo apt install apache2 -y

# Instalar MySQL (MariaDB)
sudo apt install mariadb-server mariadb-client -y

# Instalar PHP e módulos necessários
sudo apt install php php-mysql php-json php-mbstring php-zip php-gd php-xml php-curl -y

# Instalar phpMyAdmin
sudo apt install phpmyadmin -y
```

Durante a instalação do phpMyAdmin:
- Escolha "apache2" quando solicitado
- Configure uma senha para o usuário root do MySQL

## 2. Configuração do MySQL

```bash
# Configurar segurança do MySQL
sudo mysql_secure_installation

# Acessar o MySQL
sudo mysql

# Criar banco de dados e usuário
CREATE DATABASE sistema_licitacao;
CREATE USER 'seu_usuario'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON sistema_licitacao.* TO 'seu_usuario'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar o esquema do banco
mysql -u seu_usuario -p sistema_licitacao < backend/src/database/schema.sql
```

## 3. Instalação do Node.js

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 4. Configuração do Apache como Proxy Reverso

```bash
# Habilitar módulos necessários
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite

# Criar arquivo de configuração do site
sudo nano /etc/apache2/sites-available/sistema-licitacao.conf
```

Conteúdo do arquivo de configuração:
```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"

    ErrorLog ${APACHE_LOG_DIR}/sistema-licitacao-error.log
    CustomLog ${APACHE_LOG_DIR}/sistema-licitacao-access.log combined
</VirtualHost>
```

```bash
# Habilitar o site
sudo a2ensite sistema-licitacao
sudo systemctl restart apache2
```

## 5. Configuração do Projeto

```bash
# Clonar o projeto
cd /var/www
sudo git clone seu-repositorio sistema-licitacao

# Configurar permissões
sudo chown -R $USER:$USER /var/www/sistema-licitacao
```

### Backend
```bash
cd /var/www/sistema-licitacao/backend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << EOL
PORT=3001
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=sistema_licitacao
JWT_SECRET=seu_jwt_secret
EOL
```

### Frontend
```bash
cd /var/www/sistema-licitacao/frontend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << EOL
REACT_APP_API_URL=http://localhost/api
EOL
```

## 6. Configurar PM2 para Gerenciamento de Processos

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicações
cd /var/www/sistema-licitacao/backend
pm2 start src/server.js --name sistema-licitacao-api

cd /var/www/sistema-licitacao/frontend
pm2 start npm --name sistema-licitacao-frontend -- start

# Configurar PM2 para iniciar com o sistema
pm2 startup
pm2 save
```

## 7. Acessando o Sistema

- Frontend: http://localhost
- Backend API: http://localhost/api
- phpMyAdmin: http://localhost/phpmyadmin

## 8. Comandos Úteis

```bash
# Reiniciar Apache
sudo systemctl restart apache2

# Verificar status do Apache
sudo systemctl status apache2

# Logs do Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# Logs do PM2
pm2 logs

# Reiniciar aplicações
pm2 restart all

# Status do MySQL
sudo systemctl status mariadb
```

## 9. Segurança

1. Configure um firewall:
```bash
sudo ufw enable
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

2. Atualize regularmente:
```bash
sudo apt update
sudo apt upgrade
```

3. Secure MySQL:
```bash
sudo mysql_secure_installation
```

4. Configure SSL (opcional):
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache
```

## 10. Backup

1. Backup do banco de dados:
```bash
mysqldump -u seu_usuario -p sistema_licitacao > backup.sql
```

2. Backup dos arquivos:
```bash
sudo tar -czf backup.tar.gz /var/www/sistema-licitacao
