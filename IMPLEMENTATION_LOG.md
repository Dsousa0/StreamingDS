# Log de Implementação — agnostic-core Skills

**Projeto:** Streaming Hub Local  
**Data:** 2026-04-18  
**Biblioteca:** agnostic-core (github.com/paulinett1508-dev/agnostic-core)  
**Instalação:** clone direto em `./agnostic-core/` (sem .git interno)

---

## Skills Selecionadas e Implementadas

### 1. `skills/nodejs/nodejs-patterns.md`

**Arquivos:** `server/src/app.js`, `server/src/server.js`, `server/src/config/`

- `app.js` separado de `server.js` para testabilidade (importável sem iniciar servidor)
- Graceful shutdown com `SIGTERM` / `SIGINT` + timeout de segurança de 10s
- `unhandledRejection` e `uncaughtException` tratados globalmente
- Connection pooling do Mongoose com `maxPoolSize: 10`, `minPoolSize: 2`, timeouts explícitos
- Validação de variáveis de ambiente no startup (fail-fast com `process.exit(1)`)

---

### 2. `skills/nodejs/express-best-practices.md`

**Arquivo:** `server/src/app.js`

Ordem de middlewares aplicada conforme a skill:
1. `helmet()` — security headers (CSP, HSTS, nosniff, remove X-Powered-By)
2. `cors()` — origens via variável `ALLOWED_ORIGINS`, sem wildcard
3. Rate limiting — 5 req/15min em `/api/auth`, 100 req/15min global
4. `morgan` — logging de requests
5. `requestId` — injeta `X-Request-ID` para rastreabilidade end-to-end
6. `express.json({ limit: '1mb' })` — body parser com limite explícito
7. Rotas organizadas (`/api/auth`, `/api/credentials`, `/api/stream`)
8. Handler 404 antes do error handler
9. `errorHandler` — último middleware (4 parâmetros)
- `express-async-errors` instalado para propagação automática de erros async

---

### 3. `skills/backend/error-handling.md`

**Arquivos:** `server/src/utils/errors.js`, `server/src/middleware/errorHandler.js`

Hierarquia de erros implementada:
- `AppError` (base) — `isOperational: true`
- `NotFoundError` (404)
- `ValidationError` (422) — campo `details` para feedback granular
- `UnauthorizedError` (401)
- `ConflictError` (409)
- `ExternalServiceError` (502) — falhas de TMDB e Puppeteer

Middleware centralizado:
- Erros operacionais → log `warn`, resposta estruturada com `code` + `message`
- Erros de programação → log `error`, resposta genérica 500 sem stack trace
- `requestId` incluído em todos os logs

---

### 4. `skills/security/api-hardening.md`

**Arquivos:** `server/src/app.js`, `server/src/models/Credential.js`, `server/src/middleware/authenticate.js`

- Helmet com CSP personalizado, HSTS habilitado
- CORS restrito (lista de origens via env, nunca wildcard)
- Rate limiting agressivo em autenticação (5 req/15min por IP)
- JWT com expiração configurável em `authenticate.js`
- Senhas dos streamers criptografadas com **AES-256-GCM** (inclui tag de autenticação)
- `passwordEncrypted` removido do `toJSON` — nunca retornado nas respostas da API
- Validação de input antes de processar em todos os controllers

---

### 5. `skills/database/schema-design.md`

**Arquivo:** `server/src/models/Credential.js`

- Schema Mongoose com campos tipados e `required` explícito
- Índices em `{ streamer: 1 }` e `{ active: 1 }` para queries frequentes
- `timestamps: true` automático
- Criptografia encapsulada em métodos `setPassword()` / `getPassword()`
- `toJSON` remove campo sensível antes de serializar

---

### 6. `skills/devops/eruda-mobile-debug.md` + `.claude/skills/eruda/SKILL.md`

**Arquivo:** `client/vite.config.js`

- Plugin `erudaPlugin()` injetado no array `plugins` do Vite
- Auto em `vite dev`, controlado por `?debug=true` em produção
- Captura: `console.*`, `unhandledRejection`, falhas de recursos (img/script/link)
- Aba "Report" gera Markdown formatado para colar no Claude Code
- Zero overhead em produção sem a flag `?debug`

---

## Todos os Arquivos Criados

```
server/
  src/
    app.js                    Express — ordem correta de middlewares
    server.js                 Entry point + graceful shutdown + handlers globais
    config/
      env.js                  Validação de env vars (fail-fast)
      db.js                   Conexão Mongoose + connection pooling
    middleware/
      errorHandler.js         Middleware centralizado + requestId
      authenticate.js         JWT verify
    models/
      Credential.js           Schema + AES-256-GCM
    controllers/
      auth.controller.js      Login da plataforma
      credential.controller.js CRUD de credenciais
      stream.controller.js    TMDB com filtro por providers ativos
      validation.controller.js Puppeteer — validação de login
    routes/
      auth.routes.js
      credential.routes.js
      stream.routes.js
    utils/
      errors.js               Hierarquia de erros
  package.json

client/
  vite.config.js              Vite + proxy /api + Eruda plugin
  package.json

.env.example                  Template de variáveis de ambiente
.gitignore
package.json                  Scripts raiz
CLAUDE.md                     Contexto do projeto + referências às skills
IMPLEMENTATION_LOG.md         Este arquivo
```

---

## Skills Disponíveis para Próximas Fases

| Fase | Skill |
|------|-------|
| Fase 2 — Frontend Settings | `skills/frontend/tailwind-patterns.md`, `skills/frontend/ux-guidelines.md` |
| Fase 2 — Acessibilidade | `skills/frontend/accessibility.md` |
| Fase 4 — Dashboard TMDB | `skills/performance/performance-audit.md`, `skills/performance/caching-strategies.md` |
| Fase 5 — Player | `skills/frontend/pwa-offline-patterns.md` |
| Testes | `skills/testing/unit-testing.md`, `skills/testing/integration-testing.md` |
| Antes do deploy | `skills/devops/pre-deploy-checklist.md` |
| Code review | `agents/reviewers/security-reviewer.md`, `agents/reviewers/frontend-reviewer.md` |

---

## Próximos Passos (por fase do Instruções.md)

1. Copiar `.env.example` → `.env` e preencher as variáveis
2. `npm run install:all` na raiz
3. **Fase 2:** Criar frontend React — página Login, Dashboard, Settings
4. **Fase 3:** Testar `validation.controller.js` com credenciais reais via Puppeteer
5. **Fase 4:** Integrar TMDB no Dashboard com filtro de `watch_providers`
6. **Fase 5:** Implementar PlayerModal com cookies de sessão do Puppeteer
