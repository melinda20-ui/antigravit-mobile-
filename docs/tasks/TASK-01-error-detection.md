# TASK-01: Error Detection — Dialog Scanner

**Status:** ✅ Concluída  
**Tier:** 1 — Quick Win  
**Esforço:** ⭐ Baixo (< 1 dia)  
**Impacto:** 🔴 Alto  
**Fonte:** [AntigravityMobile/chat-stream.mjs:670-727](https://github.com/tody-agent/AntigravityMobile)

---

## 📋 Descrição

Implementar scanner de diálogos de erro modais que aparecem **fora** do container principal de chat (`#cascade`). Esses diálogos bloqueiam a sessão e o usuário remoto precisa ser notificado imediatamente.

## 🎯 Objetivos

- [x] Criar função `checkErrorDialogs(cdp)` que escaneia todos os contextos CDP
- [x] Detectar 6 tipos de erro: `terminated`, `quota`, `rate_limit`, `high_traffic`, `server_error`, `network_error`
- [x] Integrar no polling loop com cooldown de 30 segundos
- [x] Enviar notificação via WebSocket broadcast + Telegram

## 📁 Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/server.js` | +60 linhas: `checkErrorDialogs()` + integração no polling loop |

## 🔍 Detalhes Técnicos

### Seletores CSS para detecção
```javascript
'[role="dialog"], .dialog-shadow, .monaco-dialog-box, ' +
'[class*="dialog"], [class*="notification-toast"], ' +
'[class*="error-widget"], .notifications-toasts'
```

### Padrões de texto detectados
| Tipo | Strings detectadas |
|------|-------------------|
| `terminated` | "terminated due to error", "agent terminated" |
| `quota` | "model quota reached", "quota exhausted", "usage limit" |
| `rate_limit` | "rate limit", "too many requests", "rate_limit_error" |
| `high_traffic` | "high traffic", "overloaded" |
| `server_error` | "internal server error", "something went wrong" |
| `network_error` | "network error", "connection lost" |

### Fluxo
```
Polling Loop (cada 1s)
  └── checkErrorDialogs() [cooldown: 30s]
        ├── Escaneia todos os CDP contexts
        ├── Busca modals com seletores CSS
        ├── Filtra por texto (ignora < 5 chars ou > 2000 chars)
        └── Se encontrado:
              ├── broadcast WebSocket → 'dialog_error'
              ├── sendTelegramNotification()
              └── Console log com emoji por tipo
```

## ✅ Critérios de Aceitação

- [x] Detecta `[role="dialog"]` com texto "model quota reached"
- [x] Não processa diálogos invisíveis (`offsetParent === null`)
- [x] Cooldown de 30s evita flood de notificações
- [x] 42/42 testes existentes continuam passando
