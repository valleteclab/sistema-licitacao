# Guia de Instalação do CyberPanel na VPS Google Cloud

## 1. Requisitos Mínimos
- Ubuntu 20.04 LTS
- 2GB RAM
- 20GB SSD
- Portas necessárias: 8090 (CyberPanel), 80 (HTTP), 443 (HTTPS), 21 (FTP), 25 (SMTP)

## 2. Instalação do CyberPanel

### Instalar CyberPanel
```bash
# Baixar o script de instalação
sh <(curl https://cyberpanel.net/install.sh || wget -O - https://cyberpanel.net/install.sh)
```

Durante a instalação:
- Escolha "Full installation"
- Selecione "Yes" para instalar PowerDNS
- Selecione "Yes" para instalar Pure-FTPd
- Anote a senha do admin que será gerada ao final da instalação

## 3. Acessar o CyberPanel
- Acesse: https://seu_ip:8090
- Login padrão: admin
- Senha: (gerada durante a instalação)

## 4. Configurar MariaDB no CyberPanel

1. No painel lateral, vá para "Databases"
2. Clique em "Create Database"
3. Crie o banco sistema_licitacao:
   - Database: sistema_licitacao
   - Username: seu_usuario
   - Password: sua_senha_segura

## 5. Configurar Node.js no CyberPanel

1. Instalar Node.js via SSH:
```bash
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
```

2. Configurar PM2 para gerenciar a aplicação:
```bash
sudo npm install -g pm2
```

## 6. Configurar o Projeto

1. Criar diretório para o projeto:
```bash
mkdir -p /home/sistema-licitacao
```

2. Configurar permissões:
```bash
chown -R cyberpanel:cyberpanel /home/sistema-licitacao
```

3. Configurar o domínio no CyberPanel:
- Vá para "Websites"
- Clique em "Create Website"
- Preencha:
  * Domain: seu-dominio.com
  * Email: seu-email
  * Package: Default
  * PHP Version: 8.0

4. Configurar proxy reverso para o Node.js:
- No CyberPanel, vá para "Websites" > seu-dominio.com
- Clique em "Proxy Settings"
- Adicione:
  * Backend: http://localhost:3001 (para API)
  * Frontend: http://localhost:3000 (para React)

## 7. Deploy do Projeto

1. Transferir arquivos:
```bash
cd /home/sistema-licitacao
git clone seu-repositorio.git
```

2. Instalar dependências:
```bash
cd backend
npm install
cd ../frontend
npm install
```

3. Configurar PM2:
```bash
# Backend
cd /home/sistema-licitacao/backend
pm2 start src/server.js --name sistema-licitacao-api

# Frontend
cd /home/sistema-licitacao/frontend
pm2 start npm --name sistema-licitacao-frontend -- start
```

4. Salvar configuração do PM2:
```bash
pm2 save
pm2 startup
```

## 8. Configurar SSL

1. No CyberPanel:
- Vá para "SSL"
- Selecione seu domínio
- Clique em "Issue SSL"
- Selecione "Let's Encrypt"

## 9. Monitoramento

- Acesse os logs via CyberPanel em "Websites" > seu-dominio.com > "Access Logs"
- Monitore o Node.js com `pm2 monit`
- Verifique o status do MariaDB em "Databases" > "List Databases"

## Comandos Úteis

```bash
# Reiniciar CyberPanel
systemctl restart cyberpanel

# Verificar status do MariaDB
systemctl status mariadb

# Logs do PM2
pm2 logs

# Reiniciar aplicações
pm2 restart all
```

## Segurança

1. Altere a porta padrão do CyberPanel (8090)
2. Mantenha o sistema atualizado:
```bash
apt update && apt upgrade
```
3. Configure o firewall para permitir apenas as portas necessárias
4. Ative autenticação de dois fatores no CyberPanel

## Suporte

- Documentação oficial: https://docs.cyberpanel.net/
- Fórum: https://community.cyberpanel.net/
