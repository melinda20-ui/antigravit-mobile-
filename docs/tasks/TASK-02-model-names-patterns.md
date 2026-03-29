# TASK-02: Model Names + Error Patterns

**Status:** ✅ Concluída  
**Tier:** 1 — Quick Win  
**Esforço:** ⭐ Baixo (< 1 dia)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile/quota-service.mjs](https://github.com/tody-agent/AntigravityMobile)

---

## 📋 Descrição

Expandir os padrões de detecção de erros no polling loop de snapshot para incluir variações de texto que eram ignoradas, e atualizar o mapping de nomes de modelos do Antigravity.

## 🎯 Objetivos

- [x] Adicionar padrão `quota exhausted` à detecção de quota
- [x] Adicionar padrão `terminated due to error` à detecção de terminação
- [x] Criar novo tipo de evento `rate_limit` para detecção de rate limiting
- [x] Expandir heurísticas do supervisor com 12 novos padrões perigosos
- [x] Expandir heurísticas do supervisor com 15 novos padrões seguros

## 📁 Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/server.js` | Polling loop: +3 padrões de detecção, novo tipo `rate_limit` |
| `src/supervisor.js` | +12 risky patterns, +15 safe patterns na heurística |

## 🔍 Novos Padrões Perigosos Adicionados

```
dd if=, truncate, mkswap, swapon, iptables,
systemctl stop/disable/mask, docker rm/rmi,
pip install --system, npx|sh, git force-push/--force
```

## 🔍 Novos Padrões Seguros Adicionados

```
git log/show, node -e, tsc --noEmit, npx tsc,
head, tail, wc, du, df, pwd, echo, file, which,
find -name, grep, npm run check/build
```

## ✅ Critérios de Aceitação

- [x] `quota exhausted` detectado junto com `model quota reached`
- [x] Novo evento `rate_limit` disparado no WebSocket
- [x] Supervisor reconhece `git log` como seguro
- [x] Supervisor bloqueia `dd if=` como perigoso
