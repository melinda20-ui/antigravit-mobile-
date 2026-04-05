# TASK-10: Assist Chat Tab

**Status:** ✅ Concluída  
**Tier:** 3 — Strategic  
**Esforço:** ⭐⭐⭐ Alto (5-7 dias)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile/public/js/assist-panel.js](https://github.com/tody-agent/AntigravityMobile)  
**Dependências:** TASK-06 (CSS Modular), TASK-07 (Suggest Mode), TASK-08 (Session Stats)  
**Bloqueado por:** TASK-06, TASK-07

---

## 📋 Descrição

Criar uma nova aba "Assist" na interface mobile que permite ao usuário conversar diretamente com o supervisor AI. O supervisor pode fornecer sugestões, analisar erros, e propor ações — tudo com aprovação do usuário.

## 🎯 Objetivos

- [x] Nova aba "Assist" no workspace panel (ao lado de Files, Terminal, Git)
- [x] Interface de chat bidirecional: usuário ↔ supervisor AI
- [x] Respostas do supervisor podem incluir ações clicáveis (approve/reject)
- [x] Streaming de respostas do supervisor (via OmniRoute/Ollama)
- [x] Histórico de conversas da sessão (in-memory)
- [x] Integração com Session Stats (mostra resumo quando perguntado)
- [x] Integração com Suggest Queue (mostra sugestões pendentes)
- [x] Markdown rendering nas respostas do supervisor

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `public/js/components/assist-panel.js` | NEW | Componente de chat com supervisor |
| `public/css/assist.css` | NEW | Estilos do chat de assistente |
| `public/index.html` | MODIFY | Nova tab "Assist" no workspace |
| `public/js/app.js` | MODIFY | Inicialização do assist panel |
| `src/supervisor.js` | MODIFY | Método `chatWithUser(message)` para diálogo |
| `src/server.js` | MODIFY | Endpoints REST e WebSocket para assist chat |

## 🔍 Detalhes Técnicos

### Componente `AssistPanel`

```javascript
class AssistPanel {
    constructor(container, options) {
        this.container = container;
        this.messages = [];       // Histórico da sessão
        this.isStreaming = false;
        this.fetchWithAuth = options.fetchWithAuth;
    }

    init() {
        this.container.innerHTML = `
            <div class="assist-messages" id="assistMessages"></div>
            <div class="assist-input-area">
                <textarea id="assistInput" placeholder="Ask the supervisor..." rows="1"></textarea>
                <button id="assistSendBtn" class="panel-btn primary">Send</button>
            </div>
        `;
        this.bindEvents();
    }

    async sendMessage(text) {
        this.addMessage('user', text);
        this.isStreaming = true;
        
        try {
            const response = await this.fetchWithAuth('/api/assist/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            
            const data = await response.json();
            this.addMessage('assistant', data.reply, data.actions);
        } finally {
            this.isStreaming = false;
        }
    }

    addMessage(role, content, actions = []) {
        this.messages.push({ role, content, actions, timestamp: Date.now() });
        this.render();
    }

    render() {
        const html = this.messages.map(msg => `
            <div class="assist-message ${msg.role}">
                <div class="assist-avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
                <div class="assist-content">${this.renderMarkdown(msg.content)}</div>
                ${msg.actions?.length ? this.renderActions(msg.actions) : ''}
            </div>
        `).join('');
        
        this.container.querySelector('#assistMessages').innerHTML = html;
        this.scrollToBottom();
    }
}
```

### Método `chatWithUser` no Supervisor

```javascript
// supervisor.js
async chatWithUser(message, context = {}) {
    const systemPrompt = `You are an AI coding assistant supervisor.
You help the user understand what's happening in their Antigravity session.
Current session context:
- Uptime: ${context.uptime}
- Messages sent: ${context.messagesSent}
- Actions approved: ${context.actionsApproved}
- Errors detected: ${context.errorsDetected}
- Pending suggestions: ${context.pendingSuggestions}

Respond helpfully and concisely. You can suggest actions using this format:
[ACTION:approve] — to propose approving pending action
[ACTION:reject] — to propose rejecting pending action
[ACTION:screenshot] — to capture current screen`;

    return this.callAI([
        { role: 'system', content: systemPrompt },
        ...this.chatHistory,
        { role: 'user', content: message }
    ]);
}
```

### Endpoints REST

```
POST /api/assist/chat        → { message } → { reply, actions }
GET  /api/assist/history      → Chat history da sessão
DELETE /api/assist/history    → Limpar histórico
```

### CSS Base (`assist.css`)

```css
.assist-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.assist-message {
    display: flex;
    gap: var(--space-sm);
    max-width: 85%;
}

.assist-message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.assist-message.assistant {
    align-self: flex-start;
}

.assist-content {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
}

.assist-message.user .assist-content {
    background: var(--accent);
    color: white;
}
```

## 🧪 Testes de Verificação

- [x] Enviar mensagem e receber resposta do supervisor
- [x] Histórico mantido durante a sessão
- [x] Ações sugeridas renderizam como botões clicáveis
- [x] Markdown renderizado corretamente (code blocks, bold, etc.)
- [x] Mobile responsivo
- [x] Limpar histórico funciona
- [x] Tab "Assist" aparece e funciona no workspace panel

## ✅ Critérios de Aceitação

- [x] Chat funcional entre usuário e supervisor
- [x] Respostas contextuais (supervisor sabe estado da sessão)
- [x] Ações clicáveis inline nas respostas
- [x] Markdown rendering (pre, code, bold, italic)
- [x] Mobile-first responsive design
- [x] Tab integrada no workspace panel existente
