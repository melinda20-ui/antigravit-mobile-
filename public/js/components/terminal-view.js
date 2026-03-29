function formatEntry(entry) {
  const text = entry.text.endsWith('\n') ? entry.text : `${entry.text}\n`;
  return `[${new Date(entry.timestamp).toLocaleTimeString()}] ${text}`;
}

export class TerminalView {
  constructor(root, { fetchWithAuth, notify }) {
    this.root = root;
    this.fetchWithAuth = fetchWithAuth;
    this.notify = notify;
    this.state = {
      active: false,
      command: '',
      logs: [],
      exitCode: null,
    };
    this.renderShell();
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="workspace-section">
        <div class="workspace-card terminal-layout">
          <div class="panel-header">
            <div>
              <div class="panel-title">Remote Terminal</div>
              <div class="panel-subtitle" id="terminalStatusText">Idle</div>
            </div>
            <div class="screen-actions">
              <button class="panel-btn" id="terminalRefreshBtn">Refresh</button>
              <button class="panel-btn danger" id="terminalStopBtn">Stop</button>
            </div>
          </div>
          <div class="terminal-form">
            <input id="terminalCommandInput" class="panel-input" placeholder="npm test, git status, ./mvnw test" />
            <button class="panel-btn primary" id="terminalRunBtn">Run</button>
          </div>
          <pre class="terminal-output" id="terminalOutput">Waiting for command output...</pre>
        </div>
      </div>
    `;

    this.statusText = this.root.querySelector('#terminalStatusText');
    this.commandInput = this.root.querySelector('#terminalCommandInput');
    this.outputNode = this.root.querySelector('#terminalOutput');

    this.root
      .querySelector('#terminalRunBtn')
      .addEventListener('click', () => this.run());
    this.root
      .querySelector('#terminalStopBtn')
      .addEventListener('click', () => this.stop());
    this.root
      .querySelector('#terminalRefreshBtn')
      .addEventListener('click', () => this.refresh());
    this.commandInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.run();
      }
    });
  }

  async init() {
    await this.refresh();
  }

  renderOutput() {
    const logs = this.state.logs || [];
    this.outputNode.textContent = logs.length
      ? logs.map(formatEntry).join('')
      : 'No terminal output yet.';
    this.outputNode.scrollTop = this.outputNode.scrollHeight;
    if (this.state.active) {
      this.statusText.textContent = `Running: ${this.state.command || 'command'}`;
    } else if (this.state.command) {
      this.statusText.textContent = `Finished (${this.state.exitCode ?? 0})`;
    } else {
      this.statusText.textContent = 'Idle';
    }
  }

  handleState(state) {
    this.state = state || this.state;
    this.renderOutput();
  }

  handleOutput(entry) {
    this.state.logs = this.state.logs || [];
    this.state.logs.push(entry);
    this.renderOutput();
  }

  async refresh() {
    try {
      const response = await this.fetchWithAuth('/api/terminal/history');
      const payload = await response.json();
      this.handleState(payload);
    } catch (error) {
      this.notify(`Failed to load terminal history: ${error.message}`, 'error');
    }
  }

  async run() {
    const command = this.commandInput.value.trim();
    if (!command) return;
    try {
      const response = await this.fetchWithAuth('/api/terminal/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const payload = await response.json();
      this.handleState(payload);
    } catch (error) {
      this.notify(`Failed to run command: ${error.message}`, 'error');
    }
  }

  async stop() {
    try {
      await this.fetchWithAuth('/api/terminal/stop', { method: 'POST' });
      await this.refresh();
    } catch (error) {
      this.notify(`Failed to stop command: ${error.message}`, 'error');
    }
  }
}
