function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(value) {
  if (!value) return 'No captures yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function buildTags(timeline = {}) {
  return [
    timeline.enabled ? 'Auto capture on' : 'Auto capture off',
    `${timeline.totalEntries || 0} saved`,
    `Max ${timeline.maxEntries || 0}`,
  ];
}

export class TimelinePanel {
  constructor(root, { fetchWithAuth, notify }) {
    this.root = root;
    this.fetchWithAuth = fetchWithAuth;
    this.notify = notify;
    this.timeline = null;
    this.renderShell();
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="workspace-section split-card">
        <div class="workspace-card timeline-shell">
          <div class="panel-header">
            <div>
              <div class="panel-title">Screenshot Timeline</div>
              <div class="panel-subtitle" id="timelineSubtitle">
                Waiting for saved captures...
              </div>
            </div>
            <div class="screen-actions">
              <button class="panel-btn" id="timelineRefreshBtn">Refresh</button>
              <button class="panel-btn primary" id="timelineCaptureBtn">Capture</button>
              <button class="panel-btn danger" id="timelineClearBtn">Clear</button>
            </div>
          </div>
          <div class="assist-actions" id="timelineTags"></div>
          <div class="timeline-grid" id="timelineGrid"></div>
        </div>
      </div>
    `;

    this.subtitle = this.root.querySelector('#timelineSubtitle');
    this.tagsNode = this.root.querySelector('#timelineTags');
    this.gridNode = this.root.querySelector('#timelineGrid');
    this.captureBtn = this.root.querySelector('#timelineCaptureBtn');
    this.clearBtn = this.root.querySelector('#timelineClearBtn');

    this.root
      .querySelector('#timelineRefreshBtn')
      .addEventListener('click', () => this.refresh());
    this.captureBtn.addEventListener('click', () => this.capture());
    this.clearBtn.addEventListener('click', () => this.clear());
  }

  handleState(timeline = {}) {
    this.timeline = timeline;
    const entries = Array.isArray(timeline.entries) ? timeline.entries : [];

    this.subtitle.textContent = timeline.lastCaptureAt
      ? `Last capture ${formatTime(timeline.lastCaptureAt)}`
      : timeline.enabled
        ? 'Auto capture is armed and waiting for relevant changes.'
        : 'Manual capture is available even when auto capture is off.';

    this.tagsNode.innerHTML = buildTags(timeline)
      .map((tag) => `<span class="assist-tag">${escapeHtml(tag)}</span>`)
      .join('');

    if (!entries.length) {
      this.gridNode.innerHTML = `
        <div class="workspace-empty timeline-empty">
          <strong>No screenshots saved yet.</strong>
          <span>Use Capture to save the current Antigravity state, or enable automatic timeline capture.</span>
        </div>
      `;
      return;
    }

    this.gridNode.innerHTML = entries
      .map(
        (entry) => `
          <article class="timeline-card">
            <img
              class="timeline-thumb"
              src="${entry.url}"
              alt="Timeline screenshot from ${escapeHtml(entry.capturedAt || '')}"
              loading="lazy"
            />
            <div class="timeline-card-body">
              <div class="timeline-card-title">${formatTime(entry.capturedAt)}</div>
              <div class="panel-subtitle">
                ${escapeHtml(entry.reason || 'capture')} · ${escapeHtml(entry.sizeLabel || '')}
              </div>
              <div class="screen-actions">
                <a class="panel-btn" href="${entry.url}" target="_blank" rel="noreferrer">Open</a>
              </div>
            </div>
          </article>
        `
      )
      .join('');
  }

  async init() {
    await this.refresh();
  }

  async refresh() {
    try {
      const response = await this.fetchWithAuth('/api/timeline');
      const payload = await response.json();
      this.handleState(payload);
    } catch (error) {
      this.notify(`Failed to load timeline: ${error.message}`, 'error');
    }
  }

  async capture() {
    this.captureBtn.disabled = true;
    try {
      const response = await this.fetchWithAuth('/api/timeline/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'manual' }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Timeline capture failed');
      }

      this.handleState(payload);
      this.notify('Screenshot added to the timeline.', 'success');
    } catch (error) {
      this.notify(`Timeline capture failed: ${error.message}`, 'error');
    } finally {
      this.captureBtn.disabled = false;
    }
  }

  async clear() {
    this.clearBtn.disabled = true;
    try {
      const response = await this.fetchWithAuth('/api/timeline', {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Timeline clear failed');
      }

      this.handleState(payload);
      this.notify('Timeline cleared.', 'success');
    } catch (error) {
      this.notify(`Failed to clear timeline: ${error.message}`, 'error');
    } finally {
      this.clearBtn.disabled = false;
    }
  }
}
