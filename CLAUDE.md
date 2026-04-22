Streaming Hub Local — Fullstack

Stack: Node.js 20 + Express 4 + React 18 + Vite 5 + Tailwind CSS 3 + MongoDB 7
Submodulo: .agnostic-core/

---

## REGRA OBRIGATORIA — README e agnostic-core

Ao iniciar qualquer sessao de trabalho neste projeto:
1. Leia .agnostic-core/docs/skills-index.md para conhecer todos os skills e agents disponiveis
2. Leia .agnostic-core/docs/agent-routing-guide.md para saber qual skill/agent usar em cada tarefa
3. Consulte o skill relevante ANTES de implementar qualquer feature ou correcao

Apos QUALQUER alteracao no projeto (novo arquivo, novo endpoint, nova dependencia,
novo componente, mudanca de arquitetura, fase concluida), atualize o README.md:
- Refletir novos arquivos na secao "Estrutura do Projeto"
- Atualizar tabela de fases (marcar fase como concluida se aplicavel)
- Adicionar novas rotas de API na "API Reference"
- Atualizar dependencias/variaveis se mudarem
- Atualizar a tabela de "Skills aplicadas" se um novo skill for usado
Esta regra e inegociavel — README.md e a fonte de verdade do projeto.

---

Antes de implementar:

Backend:
  REST API design:    .agnostic-core/skills/backend/rest-api-design.md
  Error handling:     .agnostic-core/skills/backend/error-handling.md
  Seguranca de API:   .agnostic-core/skills/security/api-hardening.md
  OWASP checklist:    .agnostic-core/skills/security/owasp-checklist.md
  Banco de dados:     .agnostic-core/skills/database/query-compliance.md
  Schema design:      .agnostic-core/skills/database/schema-design.md
  Node.js patterns:   .agnostic-core/skills/nodejs/nodejs-patterns.md
  Express setup:      .agnostic-core/skills/nodejs/express-best-practices.md

Frontend:
  HTML e CSS:          .agnostic-core/skills/frontend/html-css-audit.md
  Acessibilidade:      .agnostic-core/skills/frontend/accessibility.md
  UX Guidelines:       .agnostic-core/skills/frontend/ux-guidelines.md
  CSS Governance:      .agnostic-core/skills/frontend/css-governance.md
  Tailwind:            .agnostic-core/skills/frontend/tailwind-patterns.md

Qualidade:
  Testes unitarios:    .agnostic-core/skills/testing/unit-testing.md
  Testes integracao:   .agnostic-core/skills/testing/integration-testing.md
  Performance:         .agnostic-core/skills/performance/performance-audit.md
  Validacao:           .agnostic-core/skills/audit/validation-checklist.md

Operacional:
  Commits:             .agnostic-core/skills/git/commit-conventions.md
  Branching:           .agnostic-core/skills/git/branching-strategy.md
  Debugging:           .agnostic-core/skills/audit/systematic-debugging.md

Antes de fazer deploy:
  .agnostic-core/skills/devops/pre-deploy-checklist.md
  .agnostic-core/skills/devops/deploy-procedures.md

---

Todos os Agents disponiveis:

Reviewers:
  Security Reviewer:       .agnostic-core/agents/reviewers/security-reviewer.md
  Frontend Reviewer:       .agnostic-core/agents/reviewers/frontend-reviewer.md
  Code Inspector (SPARC):  .agnostic-core/agents/reviewers/code-inspector.md
  Performance Reviewer:    .agnostic-core/agents/reviewers/performance-reviewer.md

Validators:
  Migration Validator:     .agnostic-core/agents/validators/migration-validator.md

Generators:
  Project Planner:         .agnostic-core/agents/generators/project-planner.md
  Docs Generator:          .agnostic-core/agents/generators/docs-generator.md

Specialists:
  Database Architect:      .agnostic-core/agents/specialists/database-architect.md
  DevOps Engineer:         .agnostic-core/agents/specialists/devops-engineer.md

Workflows:
  Brainstorm:              .agnostic-core/commands/workflows/brainstorm.md
  Debug:                   .agnostic-core/commands/workflows/debug.md
  Deploy:                  .agnostic-core/commands/workflows/deploy.md

---

Debug Mobile (Obrigatorio):
  Eruda ja injetado no vite.config.js (auto em dev, ?debug=true em prod)
  Skill de referencia: .agnostic-core/.claude/skills/eruda/SKILL.md

---

Convencoes do projeto:

  Backend: Node.js 20 + Express 4.x
  Frontend: React 18 + Vite 5 + Tailwind CSS 3
  Banco: MongoDB 7 via Mongoose 8
  Auth: JWT (acesso local — senha unica da plataforma)
  Criptografia: AES-256-GCM para senhas dos streamers
  Validacao de credenciais: Puppeteer (headless)
  API externa: TMDB (The Movie Database)
  Testes: Jest + Supertest
  Estilo de commits: Conventional Commits

Estrutura de arquivos:

  /
  ├── client/              React + Vite + Tailwind
  │   ├── src/
  │   │   ├── components/  Navbar, Sidebar, MovieCard, PlayerModal
  │   │   ├── hooks/       useMovies, useAuth
  │   │   ├── pages/       Login, Dashboard, Settings
  │   │   └── services/    api.js (TMDB e Backend)
  │   └── vite.config.js   (Eruda plugin incluido)
  ├── server/              Node.js + Express
  │   └── src/
  │       ├── app.js       Express config (middlewares, rotas)
  │       ├── server.js    Entry point + graceful shutdown
  │       ├── config/      env.js, db.js
  │       ├── controllers/ auth, credential, stream, validation
  │       ├── middleware/  errorHandler, authenticate
  │       ├── models/      Credential.js (AES-256-GCM)
  │       ├── routes/      auth, credential, stream
  │       └── utils/       errors.js (hierarquia de erros)
  ├── .agnostic-core/      Biblioteca de skills (oculta)
  ├── .env.example         Template de variaveis de ambiente
  └── CLAUDE.md            Este arquivo

Seguranca — regras nao negociaveis:
  - Senhas dos streamers criptografadas com AES-256-GCM antes de salvar
  - passwordEncrypted NUNCA retornado em JSON (removido no toJSON)
  - JWT com expiracao (24h padrao)
  - Rate limiting: 5 tentativas de login / 15min por IP
  - Helmet ativo com CSP configurado
  - CORS restrito a ALLOWED_ORIGINS (env)
  - Stack trace nunca exposto em producao
  - Variaveis de ambiente validadas no startup (fail-fast)
