# Frontend Redesign — Streaming Hub
**Data:** 2026-04-21
**Status:** Aprovado

---

## Identidade Visual

**Estilo:** Cinema premium — noir + editorial

| Token | Valor |
|-------|-------|
| Background principal | `#0a0a0a` |
| Background sidebar | `#0e0e0e` |
| Background cards/inputs | `#141414` |
| Borda sutil | `#1e1e1e` |
| Accent principal | `#c8a96e` (dourado) |
| Accent hover/active bg | `#c8a96e14` |
| Texto primário | `#ffffff` |
| Texto secundário | `#888888` |
| Texto muted | `#444444` |

**Tipografia:**
- Títulos e seções: `Playfair Display` (serif) — 400/700
- Interface e corpo: `Inter` (sans-serif) — 300/400/500/600

---

## Layout Geral

```
┌──────┬─────────────────────────────────────┐
│      │  HERO (banner com poster de fundo)  │
│ SIDE │─────────────────────────────────────│
│  BAR │  [busca]        [filtro gênero ▾]   │
│      │  Filmes │ Séries                    │
│ 60px │─────────────────────────────────────│
│      │  Catálogo                           │
│      │  [grid 6 cols — cards 2:3]          │
│      │  [paginação]                        │
└──────┴─────────────────────────────────────┘
```

---

## Componentes

### Sidebar (`Layout.jsx`)
- Largura: `60px`, fixa
- Logo `◈` em Playfair Display, dourado
- Ícones de navegação: `40×40px`, `border-radius: 10px`
- Estado ativo: `background: #c8a96e14`, `color: #c8a96e`
- Logout no rodapé, vermelho no hover

### Hero Banner (`DashboardPage.jsx`)
- Altura: `340px`
- Background: `gradient(direita → esquerda, #0a0a0a, transparente)` + imagem backdrop do TMDB (`w1280`)
- Exibe: badge do serviço, título em Playfair Display 42px, meta (nota ★, ano, duração), botão "Assistir agora" (dourado)
- Fade inferior para `#0a0a0a`
- O item exibido é o primeiro resultado da página atual

### Busca + Filtro
- Input: `background #141414`, `border #1e1e1e`, `border-radius 10px`
- Botão de filtro: mesmo estilo, hover borda dourada

### Tabs (Filmes / Séries)
- Font 13px/500, cor `#3a3a3a`
- Ativo: `color #fff`, underline `2px solid #c8a96e`

### MovieCard (`MovieCard.jsx`)
- `aspect-ratio: 2/3`, `border-radius: 8px`
- Hover: `scale(1.04)` na imagem + overlay escuro com título e ano
- Badge do streamer: canto superior direito, dourado, 8px uppercase
- Imagem com `filter: brightness(0.85)` padrão, `1.0` no hover

### LoginPage
- Background `#080808`
- Card centralizado: `background #0e0e0e`, `border #1c1c1c`, `border-radius 16px`
- Logo `◈` em Playfair Display + tagline
- Inputs e botão seguem o mesmo token de cores

### PlayerPage
- Background `#080808`
- Backdrop do título como hero (sem controles de streaming inline — já usa link externo)
- Botões de streaming: dourado, hover mais claro

### SettingsPage / UsersPage
- Cabeçalho com Playfair Display
- Cards de item: `background #141414`, `border #1e1e1e`, `border-radius 12px`
- Estado ativo (serviço selecionado): borda dourada, texto dourado

---

## Microinterações

| Elemento | Transição |
|----------|-----------|
| Cards — hover imagem | `transform scale(1.04)` + `filter brightness(1)` em `0.3s` |
| Cards — overlay título | `opacity 0→1` em `0.25s` |
| Nav icons | `background + color` em `0.15s` |
| Inputs / botões filtro | `border-color` em `0.2s` |
| Botões primários | `background` em `0.15s` |

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `client/src/index.css` | Import das Google Fonts |
| `client/src/components/Layout.jsx` | Sidebar redesenhada |
| `client/src/components/MovieCard.jsx` | Hover overlay, badge streamer |
| `client/src/components/SkeletonCard.jsx` | Cores atualizadas |
| `client/src/pages/LoginPage.jsx` | Visual completo |
| `client/src/pages/DashboardPage.jsx` | Hero banner + grid + tabs |
| `client/src/pages/PlayerPage.jsx` | Visual atualizado |
| `client/src/pages/SettingsPage.jsx` | Cards com novo visual |
| `client/src/pages/UsersPage.jsx` | Cards com novo visual |
