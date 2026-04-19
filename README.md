# Streaming Hub Local

Plataforma web local para centralizar e gerenciar assinaturas de streaming em um único ambiente. Gerencia credenciais com criptografia, valida logins automaticamente e exibe o catálogo filtrado pelos serviços ativos.

---

## Visão Geral

O Streaming Hub Local resolve o problema de ter múltiplas assinaturas em serviços diferentes — Netflix, Prime Video, HBO Max, Disney+ — sem um ponto centralizado de gerenciamento. A plataforma:

- Armazena credenciais **criptografadas** localmente (AES-256-GCM)
- **Valida automaticamente** cada login nos sites dos streamers via Puppeteer
- Exibe o **catálogo unificado** consumindo a TMDB API, filtrado pelos serviços ativos
- Oferece um **player interno** para reprodução sem abrir novas abas

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Backend | Node.js 20 + Express 4 |
| Banco de Dados | MongoDB 7 via Mongoose 8 |
| Automação | Puppeteer (validação headless) |
| API externa | TMDB (The Movie Database) |
| Autenticação | JWT (acesso local) |
| Criptografia | AES-256-GCM |
| Testes | Jest + Supertest |

---

## Estrutura do Projeto

```
StreamingDS/
├── client/                     # Frontend React + Vite + Tailwind
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, MovieCard, PlayerModal
│   │   ├── hooks/              # useMovies, useAuth
│   │   ├── pages/              # Login, Dashboard, Settings
│   │   └── services/           # api.js (TMDB + Backend)
│   ├── vite.config.js          # Vite + proxy /api + Eruda debug plugin
│   └── package.json
│
├── server/                     # Backend Node.js + Express
│   └── src/
│       ├── app.js              # Express: middlewares, rotas, segurança
│       ├── server.js           # Entry point + graceful shutdown
│       ├── config/
│       │   ├── env.js          # Validação de env vars no startup (fail-fast)
│       │   └── db.js           # Conexão Mongoose + connection pooling
│       ├── controllers/
│       │   ├── auth.controller.js         # Login da plataforma local
│       │   ├── credential.controller.js   # CRUD de credenciais dos streamers
│       │   ├── stream.controller.js       # Catálogo TMDB filtrado por providers ativos
│       │   └── validation.controller.js   # Puppeteer: validação headless de logins
│       ├── middleware/
│       │   ├── authenticate.js    # JWT verify
│       │   └── errorHandler.js    # Middleware centralizado + X-Request-ID
│       ├── models/
│       │   └── Credential.js      # Schema Mongoose + AES-256-GCM
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── credential.routes.js
│       │   └── stream.routes.js
│       └── utils/
│           └── errors.js          # Hierarquia de erros (AppError e subclasses)
│   └── package.json
│
├── agnostic-core/              # Biblioteca de skills, agents e workflows
├── .env.example                # Template de variáveis de ambiente
├── .gitignore
├── CLAUDE.md                   # Contexto do projeto para o Claude Code
├── IMPLEMENTATION_LOG.md       # Log das skills aplicadas
├── Instruções.md               # Especificação original do projeto
└── package.json                # Scripts raiz
```

---

## API Reference

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/login` | Login na plataforma (retorna JWT) |

### Credenciais

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/credentials` | Listar todas as credenciais |
| `POST` | `/api/credentials` | Adicionar nova credencial |
| `PATCH` | `/api/credentials/:id/validate` | Validar login do streamer via Puppeteer |
| `DELETE` | `/api/credentials/:id` | Remover credencial |

### Catálogo (TMDB)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/stream/movies` | Filmes filtrados pelos providers ativos |
| `GET` | `/api/stream/series` | Séries filtradas pelos providers ativos |
| `GET` | `/api/stream/search?q=` | Busca multi (filmes + séries) |
| `GET` | `/api/stream/genres` | Lista de gêneros disponíveis |

**Query params comuns:** `page`, `genre`

---

## Segurança

- Senhas dos streamers criptografadas com **AES-256-GCM** (inclui tag de autenticação)
- Campo `passwordEncrypted` nunca retornado nas respostas da API (removido no `toJSON`)
- **JWT** com expiração configurável (padrão 24h) para acesso à plataforma
- **Rate limiting**: 5 tentativas de login / 15min por IP
- **Helmet** com CSP configurado, HSTS, remoção de `X-Powered-By`
- **CORS** restrito às origens em `ALLOWED_ORIGINS` (nunca wildcard)
- Stack trace nunca exposto em produção
- Variáveis de ambiente validadas no startup — servidor não sobe sem variáveis críticas

---

## Como Rodar

### Pré-requisitos

- Node.js 20+
- MongoDB rodando localmente (`mongodb://localhost:27017`)
- Chave da [TMDB API](https://www.themoviedb.org/settings/api)

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas chaves
```

Variáveis obrigatórias:

```env
MONGO_URI=mongodb://localhost:27017/streamingds
JWT_SECRET=sua-chave-jwt-minimo-32-caracteres
SECRET_KEY=sua-chave-aes-256-32-caracteres
TMDB_KEY=sua-chave-tmdb
PLATFORM_PASSWORD=senha-de-acesso-local
```

### 2. Instalar dependências

```bash
npm run install:all
```

### 3. Iniciar em desenvolvimento

```bash
# Terminal 1 — Backend (porta 3001)
npm run dev:server

# Terminal 2 — Frontend (porta 5173)
npm run dev:client
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## Fases de Implementação

| Fase | Status | Descrição |
|------|--------|-----------|
| Fase 1 | ✅ Concluída | Servidor Express + Mongoose + login JWT |
| Fase 2 | 🔲 Pendente | Frontend: páginas Login, Dashboard, Settings |
| Fase 3 | 🔲 Pendente | Validação de credenciais via Puppeteer |
| Fase 4 | 🔲 Pendente | Dashboard TMDB com filtro por watch_providers |
| Fase 5 | 🔲 Pendente | Player interno com cookies de sessão |

---

## Debug Mobile (Eruda)

O projeto inclui o **Eruda DevTools** integrado ao Vite para debug em dispositivos móveis e geração de relatórios para o Claude Code.

- **Em desenvolvimento**: ativo automaticamente
- **Em produção**: ativo com `?debug=true` na URL
- **Aba Report**: gera Markdown para colar diretamente no Claude Code

---

## Biblioteca de Skills — agnostic-core

O projeto usa o [agnostic-core](https://github.com/paulinett1508-dev/agnostic-core) como biblioteca de boas práticas, instalado em `./agnostic-core/`. Contém **81+ skills**, **16 agents** e **4 workflows**.

### Skills aplicadas neste projeto

| Skill | Onde foi aplicada |
|-------|------------------|
| `nodejs/nodejs-patterns` | `server.js`, `app.js`, `config/` |
| `nodejs/express-best-practices` | `app.js` — ordem de middlewares, rate limit, CORS |
| `backend/error-handling` | `utils/errors.js`, `middleware/errorHandler.js` |
| `security/api-hardening` | Helmet, JWT, AES-256-GCM, rate limiting |
| `database/schema-design` | `models/Credential.js` — índices, criptografia, toJSON |
| `devops/eruda-mobile-debug` | `client/vite.config.js` — plugin Eruda |

### Skills disponíveis para próximas fases

| Categoria | Skill | Uso previsto |
|-----------|-------|-------------|
| Frontend | `tailwind-patterns` | Componentes Tailwind CSS v3 |
| Frontend | `ux-guidelines` | Dashboard e Settings |
| Frontend | `accessibility` | WCAG 2.1 AA em toda a UI |
| Frontend | `react-performance` | Otimização do catálogo |
| Testing | `unit-testing` | Testes dos services/utils |
| Testing | `integration-testing` | Testes de API com Supertest |
| Performance | `performance-audit` | N+1 queries, cache TMDB |
| Performance | `caching-strategies` | Cache de respostas TMDB |
| DevOps | `pre-deploy-checklist` | Antes de qualquer deploy |

### Agents disponíveis

| Grupo | Agent | Para usar quando |
|-------|-------|-----------------|
| Reviewers | `security-reviewer` | Revisar segurança dos endpoints |
| Reviewers | `frontend-reviewer` | Revisar HTML/CSS/React |
| Reviewers | `code-inspector` | Code review metodológico |
| Reviewers | `performance-reviewer` | N+1, índices, cache ausente |
| Generators | `project-planner` | Planejar próximas fases |
| Generators | `docs-generator` | Gerar documentação OpenAPI |
| Specialists | `database-architect` | Schema e índices MongoDB |
| Specialists | `devops-engineer` | Deploy, infra, rollback |

### Referência de roteamento de agents

Para saber qual agent ou skill usar para cada tarefa, consulte:
`agnostic-core/docs/agent-routing-guide.md`

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `MONGO_URI` | ✅ | URI de conexão MongoDB |
| `JWT_SECRET` | ✅ | Chave JWT (mínimo 32 caracteres) |
| `SECRET_KEY` | ✅ | Chave AES-256-GCM (32 caracteres) |
| `TMDB_KEY` | ✅ | API Key da TMDB |
| `PLATFORM_PASSWORD` | ✅ | Senha de acesso à plataforma local |
| `PORT` | — | Porta do servidor (padrão: `3001`) |
| `NODE_ENV` | — | Ambiente (padrão: `development`) |
| `JWT_EXPIRES_IN` | — | Expiração do JWT (padrão: `24h`) |
| `ALLOWED_ORIGINS` | — | Origens CORS (padrão: `http://localhost:5173`) |

---

## Conventional Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar validação Puppeteer para HBO Max
fix: corrigir criptografia quando senha tem caracteres especiais
chore: atualizar dependências do servidor
docs: atualizar README com instruções de deploy
```

---

## Licença

Uso local e privado. O `agnostic-core` é licenciado sob [MIT](agnostic-core/LICENSE).
