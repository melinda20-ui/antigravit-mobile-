function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(value) {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleTimeString();
}

function buildContextTags(context = {}) {
  const stats = context.sessionStats || {};
  const metrics = stats.metrics || {};
  const quota = context.quota || {};

  return [
    `Messages ${metrics.messagesSent || 0}`,
    `Suggestions ${context.pendingSuggestions || 0}`,
    quota.available ? `Quota ${quota.criticalModels || 0} hot` : 'Quota offline',
  ];
}

export class AssistPanel {
  constructor(root, { fetchWithAuth, notify, onAction, getContext }) {
    this.root = root;
    this.fetchWithAuth = fetchWithAuth;
    this.notify = notify;
    this.onAction = onAction;
    this.getContext = getContext;
    this.messages = [];
    this.renderShell();
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="workspace-section assist-shell">
        <div class="assist-card">
          <div class="assist-header">
            <div>
              <div class="panel-title">Assist</div>
              <div class="panel-subtitle">Ask the supervisor for session analysis and next actions.</div>
            </div>
            <div class="screen-actions">
              <button class="panel-btn" id="assistRefreshBtn">Refresh</button>
              <button class="panel-btn" id="assistClearBtn">Clear</button>
            </div>
          </div>
          <div class="assist-actions" id="assistContextTags"></div>
          <div class="assist-messages" id="assistMessages"></div>
          <div class="assist-input-area">
            <textarea
              class="panel-input assist-input"
              id="assistInput"
              rows="1"
              placeholder="Ask the supervisor about stats, quota, or pending actions..."
            ></textarea>
            <button class="panel-btn primary" id="assistSendBtn">Send</button>
          </div>
        </div>
      </div>
    `;

    this.contextTagsNode = this.root.querySelector('#assistContextTags');
    this.messagesNode = this.root.querySelector('#assistMessages');
    this.inputNode = this.root.querySelector('#assistInput');
    this.sendBtn = this.root.querySelector('#assistSendBtn');

    this.root
      .querySelector('#assistRefreshBtn')
      .addEventListener('click', () => this.refresh());
    this.root
      .querySelector('#assistClearBtn')
      .addEventListener('click', () => this.clearHistory());
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.inputNode.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.handleSend();
      }
    });
  }

  renderMarkdown(content) {
    const placeholders = [];
    let html = escapeHtml(content || '');

    html = html.replace(/```([\s\S]*?)```/g, (_, block) => {
      const key = `__CODE_BLOCK_${placeholders.length}__`;
      placeholders.push(`<pre><code>${block.trim()}</code></pre>`);
      return key;
    });

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
    );

    html = html
      .split(/\n{2,}/)
      .map((chunk) => `<p>${chunk.replace(/\n/g, '<br />')}</p>`)
      .join('');

    placeholders.forEach((value, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, value);
    });

    return html;
  }

  renderActions(messageIndex, actions = []) {
    if (!actions.length) return '';
    return `
      <div class="assist-actions">
        ${actions
          .map(
            (action, actionIndex) => `
              <button
                class="assist-action-btn"
                type="button"
                data-message-index="${messageIndex}"
                data-action-index="${actionIndex}"
              >
                ${escapeHtml(action.label || action.type || 'Run action')}
              </button>
            `
          )
          .join('')}
      </div>
    `;
  }

  renderMessages() {
    if (!this.messages.length) {
      this.messagesNode.innerHTML = `
        <div class="assist-empty">
          Ask for a session summary, quota status, or the latest pending supervisor action.
        </div>
      `;
      return;
    }

    this.messagesNode.innerHTML = this.messages
      .map(
        (message, index) => `
          <div class="assist-message ${message.role}">
            <div class="assist-avatar">${message.role === 'user' ? 'You' : 'AI'}</div>
            <div class="assist-content">
              ${this.renderMarkdown(message.content || '')}
              <div class="file-entry-meta">${formatTime(message.timestamp)}</div>
              ${this.renderActions(index, message.actions || [])}
            </div>
          </div>
        `
      )
      .join('');

    this.messagesNode
      .querySelectorAll('[data-message-index][data-action-index]')
      .forEach((button) => {
        button.addEventListener('click', async () => {
          const messageIndex = Number(button.getAttribute('data-message-index'));
          const actionIndex = Number(button.getAttribute('data-action-index'));
          const action = this.messages[messageIndex]?.actions?.[actionIndex];
          if (!action || !this.onAction) return;

          button.disabled = true;
          try {
            await this.onAction(action);
          } finally {
            button.disabled = false;
          }
        });
      });

    this.scrollToBottom();
  }

  renderContextSummary() {
    const tags = buildContextTags(this.getContext?.() || {});
    this.contextTagsNode.innerHTML = tags
      .map((tag) => `<span class="assist-tag">${escapeHtml(tag)}</span>`)
      .join('');
  }

  setMessages(messages = []) {
    this.messages = Array.isArray(messages) ? messages : [];
    this.renderContextSummary();
    this.renderMessages();
  }

  scrollToBottom() {
    this.messagesNode.scrollTop = this.messagesNode.scrollHeight;
  }

  async loadHistory() {
    const response = await this.fetchWithAuth('/api/assist/history');
    const payload = await response.json();
    this.setMessages(payload.messages || []);
  }

  async init() {
    await this.loadHistory();
  }

  async refresh() {
    try {
      await this.loadHistory();
    } catch (error) {
      this.notify(`Failed to load assist history: ${error.message}`, 'error');
    }
  }

  async clearHistory() {
    try {
      await this.fetchWithAuth('/api/assist/history', { method: 'DELETE' });
      this.setMessages([]);
      this.notify('Assist history cleared.', 'success');
    } catch (error) {
      this.notify(`Failed to clear assist history: ${error.message}`, 'error');
    }
  }

  async handleSend() {
    const message = this.inputNode.value.trim();
    if (!message) return;

    this.sendBtn.disabled = true;
    try {
      const response = await this.fetchWithAuth('/api/assist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Assist request failed');
      }

      this.inputNode.value = '';
      this.setMessages(payload.history || []);
    } catch (error) {
      this.notify(`Assist failed: ${error.message}`, 'error');
    } finally {
      this.sendBtn.disabled = false;
      this.inputNode.focus();
    }
  }
}
