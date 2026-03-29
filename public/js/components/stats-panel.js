function formatRecentError(error) {
  return `[${new Date(error.timestamp).toLocaleTimeString()}] ${error.type}: ${error.message}`;
}

function formatRecentAction(action) {
  const details = action.details ? ` ${JSON.stringify(action.details)}` : '';
  return `[${new Date(action.timestamp).toLocaleTimeString()}] ${action.type}${details}`;
}

export class StatsPanel {
  constructor(root, { fetchWithAuth, notify }) {
    this.root = root;
    this.fetchWithAuth = fetchWithAuth;
    this.notify = notify;
    this.renderShell();
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="workspace-section split-card">
        <div class="workspace-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Session Stats</div>
              <div class="panel-subtitle" id="statsPanelSubtitle">Waiting for live analytics...</div>
            </div>
            <button class="panel-btn" id="statsRefreshBtn">Refresh</button>
          </div>
          <div class="meta-grid" id="statsSummaryGrid"></div>
        </div>
        <div class="workspace-card split-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Recent Activity</div>
              <div class="panel-subtitle">Errors and actions from this session</div>
            </div>
          </div>
          <pre class="code-preview" id="statsActivity">No analytics collected yet.</pre>
        </div>
      </div>
    `;

    this.subtitle = this.root.querySelector('#statsPanelSubtitle');
    this.summaryGrid = this.root.querySelector('#statsSummaryGrid');
    this.activityNode = this.root.querySelector('#statsActivity');
    this.root
      .querySelector('#statsRefreshBtn')
      .addEventListener('click', () => this.refresh());
  }

  async init() {
    await this.refresh();
  }

  handleState(stats) {
    if (!stats) return;
    const metrics = stats.metrics || {};

    this.subtitle.textContent = `${stats.uptime} · approval ${stats.approvalRate} · errors ${stats.errorRate}`;
    this.summaryGrid.innerHTML = `
      <div class="meta-card">
        <strong>Messages</strong>
        <div>${metrics.messagesSent || 0}</div>
      </div>
      <div class="meta-card">
        <strong>Snapshots</strong>
        <div>${metrics.snapshotsProcessed || 0}</div>
      </div>
      <div class="meta-card">
        <strong>Approved</strong>
        <div>${metrics.actionsApproved || 0} (${metrics.actionsAutoApproved || 0} auto)</div>
      </div>
      <div class="meta-card">
        <strong>Suggestions</strong>
        <div>${stats.pendingSuggestions || 0} pending / ${metrics.suggestionsCreated || 0} total</div>
      </div>
      <div class="meta-card">
        <strong>Errors</strong>
        <div>${metrics.errorsDetected || 0} total</div>
      </div>
      <div class="meta-card">
        <strong>Screen + Timeline</strong>
        <div>${metrics.screenCaptures || 0} manual / ${metrics.timelineCaptures || 0} saved</div>
      </div>
      <div class="meta-card">
        <strong>Quota + Rate Limit</strong>
        <div>${metrics.quotaWarnings || 0} quota / ${metrics.rateLimitHits || 0} rate</div>
      </div>
    `;

    const actions = Array.isArray(stats.lastActions) ? stats.lastActions : [];
    const errors = Array.isArray(stats.lastErrors) ? stats.lastErrors : [];
    const lines = [
      'Recent errors:',
      ...(errors.length ? errors.map(formatRecentError) : ['None']),
      '',
      'Recent actions:',
      ...(actions.length ? actions.map(formatRecentAction) : ['None']),
    ];
    this.activityNode.textContent = lines.join('\n');
  }

  async refresh() {
    try {
      const response = await this.fetchWithAuth('/api/stats');
      const payload = await response.json();
      this.handleState(payload);
    } catch (error) {
      this.notify(`Failed to load stats: ${error.message}`, 'error');
    }
  }
}
