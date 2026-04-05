# TASK-07: Supervisor Suggest Mode

**Status:** ✅ Concluída  
**Tier:** 2 — Medium Effort  
**Esforço:** ⭐⭐ Médio (3-5 dias)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile/supervisor-service.mjs:850-1050](https://github.com/tody-agent/AntigravityMobile)  
**Dependências:** Nenhuma  
**Bloqueado por:** Nenhuma task  
**Bloqueia:** TASK-10 (Assist Chat Tab)

---

## 📋 Descrição

Adicionar um modo "Suggest" ao supervisor existente onde, em vez de executar ações diretamente, o supervisor enfileira sugestões para aprovação humana. Implementa o padrão human-in-the-loop com queue de ações.

## 🎯 Objetivos

- [x] Implementar `SuggestQueue` — fila de ações sugeridas pelo supervisor
- [x] Cada sugestão contém: ação proposta, razão, timestamp, status (pending/approved/rejected)
- [x] API REST para gerenciar a fila: list, approve, reject, clear
- [x] WebSocket broadcast quando nova sugestão é adicionada
- [x] Telegram notification com inline keyboard para aprovação rápida
- [x] Config toggle: `SUPERVISOR_SUGGEST_MODE=true/false`
- [x] Máximo de itens na fila configurável via `SUPERVISOR_MAX_QUEUE`

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/supervisor.js` | MODIFY | Adicionar `SuggestQueue` class + `suggestAction()` |
| `src/config.js` | MODIFY | Novas env vars: `SUPERVISOR_SUGGEST_MODE`, `SUPERVISOR_MAX_QUEUE` |
| `src/server.js` | MODIFY | Novos endpoints REST + WebSocket events |
| `public/js/app.js` | MODIFY | UI de notificação para sugestões pendentes |
| `src/utils/telegram.js` | MODIFY | Hook `onSuggestionCreated` com inline keyboard |

## 🔍 Detalhes Técnicos

### Classe SuggestQueue
```javascript
class SuggestQueue {
    constructor(maxSize = 10) {
        this.queue = [];        // Array de SuggestItem
        this.maxSize = maxSize;
        this.listeners = [];
    }

    add(suggestion) {
        // { id, action, reason, command, timestamp, status: 'pending' }
        if (this.queue.length >= this.maxSize) {
            this.queue.shift(); // Remove oldest
        }
        this.queue.push(suggestion);
        this.notifyListeners('added', suggestion);
    }

    approve(id) {
        const item = this.queue.find(s => s.id === id);
        if (item) {
            item.status = 'approved';
            this.notifyListeners('approved', item);
            return item;
        }
        return null;
    }

    reject(id) {
        const item = this.queue.find(s => s.id === id);
        if (item) {
            item.status = 'rejected';
            this.notifyListeners('rejected', item);
            return item;
        }
        return null;
    }

    getPending() {
        return this.queue.filter(s => s.status === 'pending');
    }

    clear() {
        this.queue = [];
    }
}
```

### Fluxo do Suggest Mode
```
Polling Loop detecta ação pendente
  └── Supervisor analisa o comando
        ├── Se SUGGEST_MODE=false: auto-approve/deny (atual)
        └── Se SUGGEST_MODE=true:
              ├── suggestQueue.add({ action, reason, command })
              ├── broadcast({ type: 'suggestion', ... })
              ├── sendActionRequired() via Telegram com botões
              └── Espera aprovação humana:
                    ├── Via UI mobile (botão approve/reject)
                    ├── Via Telegram inline button
                    └── Via API REST: POST /api/suggest/:id/approve
```

### Novos Endpoints REST
```
GET    /api/suggestions           → Lista todas as sugestões
GET    /api/suggestions/pending   → Lista apenas pendentes
POST   /api/suggestions/:id/approve → Aprova e executa a ação
POST   /api/suggestions/:id/reject  → Rejeita a sugestão
DELETE /api/suggestions           → Limpa toda a fila
```

### Novo WebSocket Event
```json
{
    "type": "suggestion",
    "event": "new_suggestion",
    "suggestion": {
        "id": "uuid",
        "action": "accept",
        "command": "npm test",
        "reason": "heuristic-safe-command",
        "timestamp": "2026-03-29T07:00:00Z",
        "status": "pending"
    }
}
```

### Variáveis de Ambiente
```env
SUPERVISOR_SUGGEST_MODE=false   # Ativar suggest mode
SUPERVISOR_MAX_QUEUE=10         # Tamanho máximo da fila
```

## 🧪 Testes de Verificação

- [x] Com `SUGGEST_MODE=false`: comportamento idêntico ao atual
- [x] Com `SUGGEST_MODE=true`: ações vão para a fila (não executadas automaticamente)
- [x] Aprovar uma sugestão executa `completePendingAction()`
- [x] Rejeitar uma sugestão marca como rejected sem ação
- [x] Fila respeita `MAX_QUEUE` (remove mais antigo quando cheia)
- [x] Telegram recebe notificação com botões approve/reject
- [x] WebSocket broadcast enviado para UI mobile

## ✅ Critérios de Aceitação

- [x] Toggle suggest mode via env var sem reiniciar
- [x] API REST CRUD completa para sugestões
- [x] Integração com Telegram (inline keyboard)
- [x] UI mobile mostra contador de sugestões pendentes
- [x] Zero breaking changes no fluxo auto-approve existente
- [x] Timeout: sugestões expiram após 30 minutos
