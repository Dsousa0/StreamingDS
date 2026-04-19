Especificação do Projeto: Streaming Hub Local
1. Visão Geral
O objetivo é criar uma plataforma WEB local para centralizar assinaturas de streaming. O sistema deve permitir o gerenciamento de credenciais, exibição de catálogo baseado em assinaturas ativas e reprodução de conteúdo em um ambiente unificado.

2. Tech Stack
Frontend: React + Vite + Tailwind CSS.

Backend: Node.js + Express.

Banco de Dados: MongoDB (Local).

Consumo de Dados: TMDB API (The Movie Database).

Automação/Validação: Puppeteer (para validar credenciais nos sites dos streamers).

3. Requisitos Funcionais (Backlog)
A. Controle de Acesso e Segurança
Implementar uma tela de login inicial para proteger o acesso à plataforma local.

No menu de Configurações, permitir que o usuário:

Selecione um serviço (Netflix, Prime Video, HBO Max, Disney+, etc.).

Insira credenciais (E-mail e Senha).

Validação: O backend deve usar o Puppeteer para tentar o login no site oficial e retornar se a credencial é válida antes de salvar no banco.

B. Gestão de Dados (MongoDB)
Criar um Schema para Credentials que armazene:

Nome do Streamer.

Credenciais (Criptografadas).

providerId (ID correspondente na API do TMDB).

Status da assinatura (active: boolean).

C. Dashboard de Conteúdo
Listar filmes e séries populares consumindo a API do TMDB.

Filtro Automático: Exibir apenas títulos disponíveis nos serviços marcados como "Válidos/Ativos" no banco de dados.

Implementar busca e categorias (Gêneros).

D. Player Interno
Ao clicar em um título, abrir o conteúdo em um Modal ou Janela Customizada dentro da plataforma.

Tentar manter a sessão ativa utilizando os cookies capturados durante a fase de validação (Puppeteer).

4. Estrutura de Arquivos Sugerida
Plaintext
/
├── client/                # React + Vite
│   ├── src/
│   │   ├── components/    # Navbar, Sidebar, MovieCard, PlayerModal
│   │   ├── hooks/         # useMovies, useAuth
│   │   ├── pages/         # Login, Dashboard, Settings
│   │   └── services/      # api.js (TMDB e Backend)
├── server/                # Node.js + Express
│   ├── models/            # Credential.js (Mongoose Schema)
│   ├── routes/            # auth.routes.js, stream.routes.js
│   ├── controllers/       # validation.controller.js (Puppeteer logic)
│   └── config/            # db.js, crypt.js
└── .env                   # TMDB_KEY, MONGO_URI, SECRET_KEY
5. Instruções de Implementação para o Claude
Fase 1: Configure o servidor Express com Mongoose e a rota de login inicial da plataforma.

Fase 2: No frontend, crie a página de configurações onde posso salvar credenciais de diferentes streamers no MongoDB.

Fase 3: Implemente a lógica de validação no backend usando Puppeteer para verificar se o login no streamer funciona.

Fase 4: Desenvolva o Dashboard consumindo o TMDB, aplicando o filtro de watch_providers baseado nas credenciais salvas no banco.

Fase 5: Crie a interface de reprodução (Player) focando em evitar a abertura de múltiplas abas do navegador.

6. Notas de Segurança
As senhas dos streamers devem ser criptografadas antes de serem salvas no MongoDB.

O sistema é para uso incialmente local (localhost).