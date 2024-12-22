#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Configurando repositório Git para o Sistema de Licitação${NC}"

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git não está instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install git -y
fi

# Inicializar repositório Git
echo -e "${YELLOW}Inicializando repositório Git...${NC}"
git init

# Adicionar arquivos ao .gitignore se ainda não existirem
if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}Criando .gitignore...${NC}"
    cp docs/gitignore_template .gitignore
fi

# Configurar Git
echo -e "${YELLOW}Digite seu nome de usuário do Git:${NC}"
read git_username
echo -e "${YELLOW}Digite seu email do Git:${NC}"
read git_email

git config user.name "$git_username"
git config user.email "$git_email"

# Adicionar arquivos
echo -e "${YELLOW}Adicionando arquivos ao Git...${NC}"
git add .

# Commit inicial
echo -e "${YELLOW}Realizando commit inicial...${NC}"
git commit -m "Initial commit: Sistema de Licitação"

# Configurar repositório remoto
echo -e "${YELLOW}Digite a URL do seu repositório GitHub (ex: https://github.com/username/repo.git):${NC}"
read repo_url

git remote add origin $repo_url

# Push para o GitHub
echo -e "${YELLOW}Fazendo push para o GitHub...${NC}"
git branch -M main
git push -u origin main

echo -e "${GREEN}Repositório configurado com sucesso!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Verifique se todos os arquivos foram enviados corretamente no GitHub"
echo "2. Configure as GitHub Actions se necessário"
echo "3. Adicione colaboradores ao repositório se necessário"
echo
echo -e "${YELLOW}Comandos Git úteis:${NC}"
echo "git status - Verificar estado dos arquivos"
echo "git add . - Adicionar todos os arquivos modificados"
echo "git commit -m 'mensagem' - Criar um novo commit"
echo "git push - Enviar alterações para o GitHub"
echo "git pull - Baixar alterações do GitHub"
echo
echo -e "${YELLOW}Para clonar este repositório em outra máquina:${NC}"
echo "git clone $repo_url"
