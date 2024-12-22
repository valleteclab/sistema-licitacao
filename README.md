# Sistema de Licitação

Sistema para gerenciamento de processos de licitação, com controle de fluxos e etapas.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- `backend/`: API REST em Node.js com Express
- `frontend/`: Interface web em React

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase (para o banco de dados)

## Configuração do Banco de Dados

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Crie as seguintes tabelas:

```sql
-- Tabela de usuários
create table usuarios (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  tipo text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de fluxos
create table fluxos (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  descricao text,
  etapas text not null,
  status text not null,
  usuario_id uuid references usuarios(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de processos
create table processos (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  descricao text,
  fluxo_id uuid references fluxos(id),
  documentos text,
  status text not null,
  etapa_atual integer not null,
  usuario_id uuid references usuarios(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de histórico de processos
create table historico_processos (
  id uuid default uuid_generate_v4() primary key,
  processo_id uuid references processos(id),
  etapa integer not null,
  observacao text,
  usuario_id uuid references usuarios(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Instalação

1. Clone o repositório
2. Configure as variáveis de ambiente:

### Backend
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
JWT_SECRET=seu_jwt_secret
```

### Frontend
```bash
cd frontend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
REACT_APP_API_URL=http://localhost:3001/api
```

3. Instale as dependências:

```bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

## Executando o Projeto

1. Inicie o backend:
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd frontend
npm start
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:3001`.

## Funcionalidades

- Autenticação de usuários
- Gestão de fluxos de licitação
- Gestão de processos
- Acompanhamento de etapas
- Histórico de alterações

## Tecnologias Utilizadas

- Backend:
  - Node.js
  - Express
  - JWT
  - Supabase
  - BCrypt

- Frontend:
  - React
  - Material-UI
  - React Router
  - Axios

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
