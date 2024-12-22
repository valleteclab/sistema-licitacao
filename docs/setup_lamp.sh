#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Iniciando instalação do LAMP Stack e configuração do Sistema de Licitação${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute este script como root (sudo ./setup_lamp.sh)${NC}"
    exit 1
fi

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro: $1${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}Atualizando o sistema...${NC}"
apt update && apt upgrade -y
check_error "Falha ao atualizar o sistema"

echo -e "${YELLOW}Instalando Apache...${NC}"
apt install apache2 -y
check_error "Falha ao instalar Apache"

echo -e "${YELLOW}Instalando MariaDB...${NC}"
apt install mariadb-server mariadb-client -y
check_error "Falha ao instalar MariaDB"

echo -e "${YELLOW}Instalando PHP e módulos...${NC}"
apt install php php-mysql php-json php-mbstring php-zip php-gd php-xml php-curl -y
check_error "Falha ao instalar PHP"

echo -e "${YELLOW}Instalando phpMyAdmin...${NC}"
echo "phpmyadmin phpmyadmin/dbconfig-install boolean true" | debconf-set-selections
echo "phpmyadmin phpmyadmin/app-password-confirm password root" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/admin-pass password root" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/app-pass password root" | debconf-set-selections
echo "phpmyadmin phpmyadmin/reconfigure-webserver multiselect apache2" | debconf-set-selections
apt install phpmyadmin -y
check_error "Falha ao instalar phpMyAdmin"

echo -e "${YELLOW}Configurando MySQL...${NC}"
mysql -e "CREATE DATABASE IF NOT EXISTS sistema_licitacao;"
mysql -e "CREATE USER IF NOT EXISTS 'sistema_user'@'localhost' IDENTIFIED BY 'sistema_password';"
mysql -e "GRANT ALL PRIVILEGES ON sistema_licitacao.* TO 'sistema_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
check_error "Falha ao configurar MySQL"

echo -e "${YELLOW}Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs
check_error "Falha ao instalar Node.js"

echo -e "${YELLOW}Instalando PM2...${NC}"
npm install -g pm2
check_error "Falha ao instalar PM2"

echo -e "${YELLOW}Configurando Apache...${NC}"
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod rewrite
check_error "Falha ao habilitar módulos do Apache"

# Criar arquivo de configuração do Apache
cat > /etc/apache2/sites-available/sistema-licitacao.conf << EOL
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

    ErrorLog \${APACHE_LOG_DIR}/sistema-licitacao-error.log
    CustomLog \${APACHE_LOG_DIR}/sistema-licitacao-access.log combined
</VirtualHost>
EOL

echo -e "${YELLOW}Habilitando site...${NC}"
a2ensite sistema-licitacao
systemctl restart apache2
check_error "Falha ao habilitar site"

echo -e "${YELLOW}Configurando firewall...${NC}"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
check_error "Falha ao configurar firewall"

echo -e "${YELLOW}Configurando diretório do projeto...${NC}"
mkdir -p /var/www/sistema-licitacao
chown -R $SUDO_USER:$SUDO_USER /var/www/sistema-licitacao
check_error "Falha ao configurar diretório do projeto"

echo -e "${GREEN}Instalação concluída!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Copie os arquivos do projeto para /var/www/sistema-licitacao"
echo "2. Configure os arquivos .env do backend e frontend"
echo "3. Execute os seguintes comandos:"
echo "   cd /var/www/sistema-licitacao/backend"
echo "   npm install"
echo "   pm2 start src/server.js --name sistema-licitacao-api"
echo "   cd ../frontend"
echo "   npm install"
echo "   pm2 start npm --name sistema-licitacao-frontend -- start"
echo
echo "O sistema estará disponível em:"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
echo "phpMyAdmin: http://localhost/phpmyadmin"
echo
echo -e "${YELLOW}Credenciais do banco de dados:${NC}"
echo "Database: sistema_licitacao"
echo "Username: sistema_user"
echo "Password: sistema_password"
