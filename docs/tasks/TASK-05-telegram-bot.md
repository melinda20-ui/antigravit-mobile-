# TASK-05: Telegram Bot Interativo

**Status:** ✅ Concluída  
**Tier:** 2 — Medium Effort  
**Esforço:** ⭐⭐⭐ Alto (3 dias)  
**Impacto:** 🔴 Alto  
**Fonte:** [AntigravityMobile/telegram-bot.mjs](https://github.com/tody-agent/AntigravityMobile) (465 linhas)

---

## 📋 Descrição

Reescrita completa do módulo Telegram de webhook simples (42 linhas) para um bot interativo completo (450+ linhas) com commands, inline keyboards, threading, rate limiting e screenshot via Telegram.

## 🎯 Objetivos

- [x] Substituir `utils/telegram.js` simples por módulo completo
- [x] 6 comandos interativos: `/start`, `/help`, `/status`, `/approve`, `/reject`, `/screenshot`
- [x] Inline keyboard buttons para ações de approve/reject
- [x] Rate limiting: 30 msg/min sliding window (configurável via `TELEGRAM_RATE_LIMIT`)
- [x] Message threading: agrupamento de notificações por tipo (5min TTL)
- [x] 8 toggles individuais para tipos de notificação
- [x] Lazy-loading do `node-telegram-bot-api` (fallback para webhook se não instalado)
- [x] Hook system: server registra callbacks (approve/reject/status/screenshot)
- [x] Graceful shutdown: bot polling para limpo em SIGTERM/SIGINT

## 📁 Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/utils/telegram.js` | Reescrita completa: 42 → 450+ linhas |
| `src/server.js` | Novos imports + `initTelegramBot()` + `registerTelegramHooks()` no startup |

## 🔍 Detalhes Técnicos

### Exports do módulo
```javascript
export { sendTelegramNotification }     // Compatível com uso existente
export { sendTypedNotification }        // Com threading e toggles
export { sendActionRequired }           // Com inline keyboard
export { initTelegramBot }              // Inicialização lazy
export { registerTelegramHooks }        // Hooks do server
export { isBotActive }                  // Status check
export { getNotificationToggles }       // Estado dos toggles
export { stopBot }                      // Graceful shutdown
```

### Variáveis de ambiente
```env
TELEGRAM_BOT_TOKEN=           # Token do BotFather (obrigatório)
TELEGRAM_CHAT_ID=             # Chat ID do admin (obrigatório)
TELEGRAM_RATE_LIMIT=30        # Limite por minuto (opcional, default: 30)
```

### Hooks registrados no server.js
```javascript
registerTelegramHooks({
    onApprove: () => completePendingAction(cdpConnection, 'accept'),
    onReject:  () => completePendingAction(cdpConnection, 'reject'),
    onStatus:  () => ({ cdpConnected, supervisorEnabled, model, uptime }),
    onScreenshot: () => cdpConnection.call('Page.captureScreenshot', ...)
});
```

### Dependência opcional
```bash
npm install node-telegram-bot-api  # Instalar para modo interativo
# Sem instalar, funciona em modo webhook fallback
```

## ✅ Critérios de Aceitação

- [x] Bot responde a `/status` com dados de conexão
- [x] `/approve` e `/reject` executam ações via CDP
- [x] `/screenshot` captura e envia foto do IDE
- [x] Inline buttons em notificações de "action required"
- [x] Rate limit bloqueia > 30 msgs/min
- [x] Threading agrupa notificações do mesmo tipo
- [x] Sem crash se `node-telegram-bot-api` não instalado
- [x] Graceful shutdown para polling
