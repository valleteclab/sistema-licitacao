# Configuração do Repositório no GitHub

## 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no botão "+" no canto superior direito
3. Selecione "New repository"
4. Preencha:
   - Repository name: sistema-licitacao
   - Description: Sistema de Gestão de Licitações
   - Visibility: Public ou Private
   - Initialize with: Não selecione nada
5. Clique em "Create repository"

## 2. Configurar Git Localmente

1. Instalar Git (se ainda não estiver instalado):
```bash
sudo apt update
sudo apt install git
```

2. Configurar credenciais:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

3. Gerar chave SSH (opcional, mas recomendado):
```bash
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"
cat ~/.ssh/id_ed25519.pub
```
- Adicione a chave pública ao GitHub em Settings > SSH and GPG keys

## 3. Inicializar Repositório

1. Na pasta do projeto, dê permissão ao script:
```bash
chmod +x setup_git.sh
```

2. Execute o script:
```bash
./setup_git.sh
```

3. Siga as instruções do script, fornecendo:
   - Nome de usuário do Git
   - Email do Git
   - URL do repositório GitHub

## 4. Estrutura de Branches Recomendada

```
main           # Código em produção
├── develop    # Código em desenvolvimento
├── feature/*  # Novas funcionalidades
└── hotfix/*   # Correções urgentes
```

Comandos para criar branches:
```bash
# Branch de desenvolvimento
git checkout -b develop main

# Branch de feature
git checkout -b feature/nome-da-feature develop

# Branch de hotfix
git checkout -b hotfix/nome-do-fix main
```

## 5. Workflow Recomendado

1. Desenvolvimento de nova feature:
```bash
git checkout develop
git pull
git checkout -b feature/nova-funcionalidade
# Faça suas alterações
git add .
git commit -m "feat: descrição da funcionalidade"
git push origin feature/nova-funcionalidade
```

2. Correção de bug:
```bash
git checkout main
git pull
git checkout -b hotfix/correcao-bug
# Faça suas correções
git add .
git commit -m "fix: descrição da correção"
git push origin hotfix/correcao-bug
```

## 6. Boas Práticas

### Commits
Use mensagens de commit semânticas:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` alteração em documentação
- `style:` formatação de código
- `refactor:` refatoração de código
- `test:` adição/modificação de testes
- `chore:` alterações em build, configs, etc

Exemplo:
```bash
git commit -m "feat: adiciona validação de CPF"
git commit -m "fix: corrige cálculo de valores"
```

### Pull Requests
1. Mantenha PRs pequenos e focados
2. Descreva claramente as alterações
3. Adicione screenshots se houver mudanças visuais
4. Faça self-review antes de solicitar revisão
5. Responda aos comentários dos revisores

### Proteção de Branches
Configure no GitHub:
1. Settings > Branches > Add rule
2. Proteja as branches main e develop:
   - Require pull request reviews
   - Require status checks
   - Include administrators

## 7. CI/CD (Opcional)

Crie o arquivo `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install Dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
        
    - name: Run Tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
```

## 8. Manutenção

### Atualizar repositório local:
```bash
git fetch --all
git pull
```

### Limpar branches locais obsoletas:
```bash
git fetch -p
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D
```

### Backup do repositório:
```bash
git clone --mirror https://github.com/seu-usuario/sistema-licitacao.git
```

## 9. Resolução de Problemas

### Reverter último commit (ainda não publicado):
```bash
git reset --soft HEAD~1
```

### Reverter commit específico:
```bash
git revert commit-hash
```

### Resolver conflitos:
```bash
git fetch origin
git merge origin/branch-name
# Resolva os conflitos manualmente
git add .
git commit -m "merge: resolve conflitos"
```

### Limpar alterações não commitadas:
```bash
git stash
# ou
git checkout -- .
