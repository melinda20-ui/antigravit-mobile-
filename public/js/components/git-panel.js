function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export class GitPanel {
  constructor(root, { fetchWithAuth, notify }) {
    this.root = root;
    this.fetchWithAuth = fetchWithAuth;
    this.notify = notify;
    this.renderShell();
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="workspace-section split-card">
        <div class="workspace-card git-layout">
          <div class="panel-header">
            <div>
              <div class="panel-title">Git Panel</div>
              <div class="panel-subtitle" id="gitBranchLabel">Loading...</div>
            </div>
            <button class="panel-btn" id="gitRefreshBtn">Refresh</button>
          </div>
          <div class="meta-grid" id="gitMetaGrid"></div>
          <div class="git-file-list file-list" id="gitFiles"></div>
        </div>
        <div class="workspace-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Actions</div>
              <div class="panel-subtitle">Add, commit and push from the phone.</div>
            </div>
          </div>
          <div class="git-actions">
            <button class="panel-btn" id="gitAddBtn">Add All</button>
            <button class="panel-btn" id="gitPushBtn">Push</button>
          </div>
          <div class="git-actions">
            <input class="panel-input" id="gitCommitInput" placeholder="Commit message" />
            <button class="panel-btn primary" id="gitCommitBtn">Commit</button>
          </div>
        </div>
      </div>
    `;

    this.branchLabel = this.root.querySelector('#gitBranchLabel');
    this.metaGrid = this.root.querySelector('#gitMetaGrid');
    this.filesNode = this.root.querySelector('#gitFiles');
    this.commitInput = this.root.querySelector('#gitCommitInput');

    this.root
      .querySelector('#gitRefreshBtn')
      .addEventListener('click', () => this.refresh());
    this.root
      .querySelector('#gitAddBtn')
      .addEventListener('click', () => this.addAll());
    this.root
      .querySelector('#gitCommitBtn')
      .addEventListener('click', () => this.commit());
    this.root
      .querySelector('#gitPushBtn')
      .addEventListener('click', () => this.push());
  }

  async init() {
    await this.refresh();
  }

  renderSummary(summary) {
    this.branchLabel.textContent = `${summary.branch} · ahead ${summary.ahead} · behind ${summary.behind}`;
    this.metaGrid.innerHTML = `
      <div class="meta-card">
        <strong>Status</strong>
        <div>${summary.clean ? 'Clean worktree' : `${summary.files.length} changed file(s)`}</div>
      </div>
      <div class="meta-card">
        <strong>Last Commit</strong>
        <div>${escapeHtml(summary.lastCommit || 'No commits')}</div>
      </div>
      <div class="meta-card">
        <strong>Diff</strong>
        <div>${escapeHtml(summary.diffStat || 'No unstaged diff')}</div>
      </div>
      <div class="meta-card">
        <strong>Staged</strong>
        <div>${escapeHtml(summary.stagedStat || 'Nothing staged')}</div>
      </div>
    `;

    this.filesNode.innerHTML = summary.files.length
      ? summary.files
          .map(
            (file) => `
              <div class="file-entry">
                <div>
                  <strong>${escapeHtml(file.path)}</strong>
                  <div class="file-entry-meta">Status ${escapeHtml(file.status)}</div>
                </div>
              </div>
            `
          )
          .join('')
      : '<div class="workspace-empty">Working tree is clean.</div>';
  }

  async refresh() {
    try {
      const response = await this.fetchWithAuth('/api/git/status');
      const payload = await response.json();
      this.renderSummary(payload);
    } catch (error) {
      this.notify(`Failed to load Git status: ${error.message}`, 'error');
    }
  }

  async addAll() {
    try {
      await this.fetchWithAuth('/api/git/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      this.notify('All changes added to Git index.', 'success');
      await this.refresh();
    } catch (error) {
      this.notify(`Failed to add files: ${error.message}`, 'error');
    }
  }

  async commit() {
    const message = this.commitInput.value.trim();
    if (!message) return;
    try {
      await this.fetchWithAuth('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      this.commitInput.value = '';
      this.notify('Commit created successfully.', 'success');
      await this.refresh();
    } catch (error) {
      this.notify(`Failed to commit: ${error.message}`, 'error');
    }
  }

  async push() {
    try {
      await this.fetchWithAuth('/api/git/push', { method: 'POST' });
      this.notify('Git push finished.', 'success');
      await this.refresh();
    } catch (error) {
      this.notify(`Failed to push: ${error.message}`, 'error');
    }
  }
}
