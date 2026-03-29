# TASK-03: Auto-Accept Safety Guards

**Status:** ✅ Concluída  
**Tier:** 1 — Quick Win  
**Esforço:** ⭐ Baixo (< 1 dia)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile/chat-stream.mjs:180-196](https://github.com/tody-agent/AntigravityMobile)

---

## 📋 Descrição

Aprimorar a função `completePendingAction()` para nunca clicar em botões que concedem permissões permanentes, e suportar múltiplos botões simultâneos com delays incrementais.

## 🎯 Objetivos

- [x] Bloquear cliques em "Always Run", "Always Allow", "Trust Workspace"
- [x] Suportar múltiplos botões de accept simultâneos
- [x] Implementar delays incrementais (800ms) entre clicks
- [x] Expandir textos aceitos: "allow once", "allow this conversation", "continue", "proceed"

## 📁 Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/server.js` | `completePendingAction()`: +21 linhas, lógica de safety + multi-button |

## 🔍 Detalhes Técnicos

### Botões bloqueados (dangerous texts)
```javascript
const dangerousTexts = [
    'always run', 'always allow', 'ask every time',
    'trust workspace', 'trust this workspace'
];
```

### Lógica de multi-button
```javascript
// Click com delays incrementais para race condition prevention
for (let i = 0; i < targetBtns.length; i++) {
    const delay = i * 800; // 800ms entre clicks
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    targetBtns[i].click();
}
```

### Proteção
```
Botão "Run Command" → ✅ Clicado (seguro)
Botão "Allow Once" → ✅ Clicado (permissão temporária)
Botão "Always Allow" → ❌ Bloqueado (permissão permanente!)
Botão "Trust Workspace" → ❌ Bloqueado (permissão permanente!)
```

## ✅ Critérios de Aceitação

- [x] "Always Allow" nunca é clicado automaticamente
- [x] Múltiplos botões clicados com delay de 800ms
- [x] Response inclui `buttonsClicked` count
- [x] Backward-compatible com auto-approve existente
