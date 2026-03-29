# TASK-08: Session Stats & Analytics

**Status:** 🔄 Pendente  
**Tier:** 2 — Medium Effort  
**Esforço:** ⭐⭐ Médio (2-3 dias)  
**Impacto:** 🟡 Baixo  
**Fonte:** [AntigravityMobile/supervisor-service.mjs:sessionStats](https://github.com/tody-agent/AntigravityMobile)  
**Dependências:** Nenhuma  
**Bloqueado por:** Nenhuma task

---

## 📋 Descrição

Criar um módulo de analytics de sessão que rastreie métricas em tempo real: mensagens enviadas, ações aprovadas/rejeitadas, erros detectados, tempo de sessão, e quota usage. Exibir resumo no mobile e Telegram.

## 🎯 Objetivos

- [ ] Criar módulo `src/session-stats.js` com tracking de métricas
- [ ] Integrar no polling loop e nos handlers de ação
- [ ] Widget resumo na UI mobile (stats bar ou modal)
- [ ] Endpoint REST para consulta de stats
- [ ] Reset automático por sessão (baseado em new-chat)
- [ ] Comando `/stats` no Telegram bot

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/session-stats.js` | NEW | Módulo de tracking de métricas |
| `src/server.js` | MODIFY | Integrar stats nos handlers existentes |
| `src/utils/telegram.js` | MODIFY | Adicionar comando `/stats` |
| `public/js/app.js` | MODIFY | Widget de stats na UI |
| `public/js/components/stats-panel.js` | NEW | Componente de visualização de stats |

## 🔍 Detalhes Técnicos

### Estrutura do módulo `session-stats.js`
```javascript
class SessionStats {
    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = Date.now();
        this.metrics = {
            messagessSent: 0,
            snapshotsProcessed: 0,
            actionsApproved: 0,
            actionsRejected: 0,
            actionsAutoApproved: 0,
            errorsDetected: 0,
            dialogErrorsDetected: 0,
            telegramNotificationsSent: 0,
            quotaWarnings: 0,
            rateLimitHits: 0,
            reconnections: 0,
            suggestionsCreated: 0,   // Para TASK-07
            suggestionsApproved: 0,
            suggestionsRejected: 0,
        };
        this.errorLog = [];          // Últimos 50 erros
        this.actionLog = [];         // Últimas 100 ações
    }

    increment(metric, amount = 1) { ... }
    logError(type, message) { ... }
    logAction(type, details) { ... }

    getSummary() {
        return {
            uptime: this.getUptime(),
            metrics: { ...this.metrics },
            errorRate: this.calculateErrorRate(),
            approvalRate: this.calculateApprovalRate(),
            lastErrors: this.errorLog.slice(-5),
            lastActions: this.actionLog.slice(-10),
        };
    }

    getUptime() {
        const ms = Date.now() - this.startTime;
        const hours = Math.floor(ms / 3600000);
        const mins = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${mins}m`;
    }

    calculateErrorRate() {
        const total = this.metrics.snapshotsProcessed || 1;
        return ((this.metrics.errorsDetected / total) * 100).toFixed(2) + '%';
    }

    calculateApprovalRate() {
        const total = this.metrics.actionsApproved + this.metrics.actionsRejected || 1;
        return ((this.metrics.actionsApproved / total) * 100).toFixed(0) + '%';
    }
}

export const sessionStats = new SessionStats();
```

### Pontos de Integração no server.js
```javascript
// Em sendMessage handler:
sessionStats.increment('messagesSent');

// Em captureSnapshot (polling loop):
sessionStats.increment('snapshotsProcessed');

// Em completePendingAction (auto-approve):
sessionStats.increment('actionsAutoApproved');

// Em checkErrorDialogs:
sessionStats.increment('dialogErrorsDetected');
sessionStats.logError(dialogError.type, dialogError.error);

// Em reconnect:
sessionStats.increment('reconnections');
```

### Endpoint REST
```
GET /api/stats → SessionStats.getSummary()
```

### Telegram `/stats`
```
📊 Session Stats
─────────────────
⏱️ Uptime: 2h 34m
💬 Messages: 47
📸 Snapshots: 8,421
✅ Auto-approved: 12
❌ Rejected: 2
🚨 Errors: 3 (0.04%)
📈 Approval Rate: 86%
```

### UI Widget (stats bar no topo)
```html
<div class="stats-bar">
  <span>⏱️ 2h 34m</span>
  <span>💬 47</span>
  <span>✅ 12</span>
  <span>🚨 3</span>
</div>
```

## 🧪 Testes de Verificação

- [ ] Contador de mensagens incrementa corretamente
- [ ] Reset funciona ao criar novo chat
- [ ] Stats persistem durante reconexão CDP
- [ ] API REST retorna JSON válido
- [ ] Telegram `/stats` formata corretamente
- [ ] UI widget atualiza em tempo real via WebSocket

## ✅ Critérios de Aceitação

- [ ] 15+ métricas rastreadas de forma silenciosa (sem overhead)
- [ ] Endpoint REST com resumo completo
- [ ] Widget compacto na UI mobile
- [ ] Comando `/stats` no Telegram
- [ ] Reset automático por new-chat
- [ ] Log circular de erros e ações (memória limitada)
