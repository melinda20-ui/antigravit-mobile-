# TASK-06: CSS Modular + Sistema de Temas

**Status:** ✅ Concluída  
**Tier:** 2 — Medium Effort  
**Esforço:** ⭐⭐ Médio (3-4 dias)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile/public/css/](https://github.com/tody-agent/AntigravityMobile)  
**Dependências:** Nenhuma  
**Bloqueado por:** Nenhuma task

---

## 📋 Descrição

Refatorar a estrutura CSS monolítica atual em módulos especializados com design tokens centralizados e suporte a 5+ temas. Isso permitirá manutenção mais fácil e customização visual pelo usuário.

## 🎯 Objetivos

- [x] Refatorar `variables.css` com design tokens completos (cores, espaçamentos, tipografia, sombras)
- [x] Separar `components.css` (9KB) em 3+ arquivos menores por domínio
- [x] Criar `chat.css` para estilos específicos de mensagens/snapshot
- [x] Criar `workspace.css` para file browser, terminal e git panel
- [x] Criar `assist.css` base para futura TASK-10
- [x] Expandir `themes.css` de 2 temas (dark/light) para 5 temas:
  - `dark` (default) — tema escuro com acentos roxos
  - `light` — tema claro limpo
  - `pastel` — tons suaves pastel
  - `rainbow` — acentos coloridos vibrantes
  - `slate` — cinza neutro profissional

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `public/css/variables.css` | REFACTOR | Expandir com tokens completos |
| `public/css/layout.css` | REFACTOR | Manter, limpar duplicatas |
| `public/css/components.css` | REFACTOR | Extrair chat e workspace |
| `public/css/themes.css` | REFACTOR | Adicionar 3 novos temas |
| `public/css/chat.css` | NEW | Estilos de snapshot/mensagem |
| `public/css/workspace.css` | NEW | File browser, terminal, git |
| `public/css/assist.css` | NEW | Base para Assist Chat tab |
| `public/index.html` | MODIFY | Adicionar novos `<link>` CSS |
| `public/js/app.js` | MODIFY | Theme selector com 5 opções |

## 🔍 Detalhes Técnicos

### Estrutura alvo de `variables.css`
```css
:root {
  /* === Colors === */
  --color-primary: #7c3aed;
  --color-primary-light: #a78bfa;
  --color-primary-dark: #5b21b6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* === Spacing === */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* === Typography === */
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* === Borders & Radius === */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.2);

  /* === Transitions === */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### Estrutura de temas em `themes.css`
```css
[data-theme="dark"] {
  --bg-primary: #0a0a0f;
  --bg-secondary: #15151e;
  --bg-card: #1a1a28;
  --text-main: #e4e4e7;
  --text-muted: #71717a;
  --accent: #7c3aed;
  --border-color: rgba(255,255,255,0.08);
}

[data-theme="pastel"] {
  --bg-primary: #faf5ff;
  --bg-secondary: #f3e8ff;
  --bg-card: #ede9fe;
  --text-main: #3f3f46;
  --text-muted: #71717a;
  --accent: #8b5cf6;
  --border-color: rgba(139,92,246,0.15);
}

/* ... rainbow, slate */
```

### Migração de componentes (components.css → chat.css + workspace.css)
```
ANTES:
  components.css (9KB) — tudo junto

DEPOIS:
  components.css (~3KB) — botões, modals, notificações, forms
  chat.css (~3KB)       — .chat-content, .snapshot-shell, pre/code blocks
  workspace.css (~3KB)  — .file-item, .terminal-line, .git-diff
```

## 🧪 Testes de Verificação

- [x] Todos os 5 temas renderizam sem CSS quebrado
- [x] Troca de tema funciona em tempo real sem flash
- [x] `meta[name="theme-color"]` atualiza com o tema
- [x] Nenhum estilo hardcoded (tudo via CSS variables)
- [x] Mobile responsivo mantido em todos os temas
- [x] Performance: nenhum layout shift ao trocar tema

## ✅ Critérios de Aceitação

- [x] 5 temas funcionais com preview
- [x] Design tokens centralizados em `variables.css`
- [x] Zero CSS inline nos arquivos JS (tudo via classes)
- [x] `themes.css` como single source of truth para cores
- [x] Backward-compatible: dark/light existentes mantidos idênticos
