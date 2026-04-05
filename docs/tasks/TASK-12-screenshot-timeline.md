# TASK-12: Screenshot Timeline

**Status:** ✅ Concluída  
**Tier:** 3 — Strategic  
**Esforço:** ⭐⭐ Médio (3-5 dias)  
**Impacto:** 🟡 Baixo  
**Fonte:** [AntigravityMobile/screenshots feature](https://github.com/tody-agent/AntigravityMobile)  
**Dependências:** Nenhuma  
**Bloqueado por:** Nenhuma task

---

## 📋 Descrição

Implementar captura automática de screenshots do IDE em intervalos configuráveis, com armazenamento em disco e visualização em timeline na UI mobile. Permite ao usuário revisar o progresso do agente ao longo do tempo.

## 🎯 Objetivos

- [x] Captura automática de screenshots via CDP (`Page.captureScreenshot`)
- [x] Armazenamento em disco: `data/screenshots/` com naming temporal
- [x] Intervalo configurável (default: 60s, quando há mudanças no snapshot)
- [x] Timeline visual na UI mobile com thumbnails clicáveis
- [x] Endpoint REST para listar e recuperar screenshots
- [x] Limpeza automática (manter últimos N screenshots ou últimas X horas)
- [x] Exportar timeline como ZIP (opcional)

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/screenshot-timeline.js` | NEW | Motor de captura e gerenciamento |
| `src/server.js` | MODIFY | Endpoints REST + integração no polling |
| `public/js/components/timeline-panel.js` | NEW | Componente de visualização |
| `public/js/app.js` | MODIFY | Tab ou botão para abrir timeline |

## 🔍 Detalhes Técnicos

### Módulo `screenshot-timeline.js`

```javascript
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'fs';

class ScreenshotTimeline {
    constructor(options = {}) {
        this.directory = options.directory || 'data/screenshots';
        this.maxScreenshots = options.maxScreenshots || 100;
        this.captureInterval = options.captureInterval || 60000; // 60s
        this.lastCaptureHash = null;
        this.timer = null;

        if (!existsSync(this.directory)) {
            mkdirSync(this.directory, { recursive: true });
        }
    }

    /**
     * Captura um screenshot via CDP e salva no disco.
     * Só captura se o snapshot mudou desde a última captura.
     */
    async capture(cdpConnection, snapshotHash) {
        // Evita capturar snapshots duplicados
        if (snapshotHash === this.lastCaptureHash) return null;
        this.lastCaptureHash = snapshotHash;

        try {
            const result = await cdpConnection.call('Page.captureScreenshot', {
                format: 'jpeg',
                quality: 60
            });

            if (!result.data) return null;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot-${timestamp}.jpg`;
            const filepath = join(this.directory, filename);

            writeFileSync(filepath, Buffer.from(result.data, 'base64'));
            this.cleanup();

            return {
                filename,
                filepath,
                timestamp: new Date().toISOString(),
                size: Buffer.from(result.data, 'base64').length
            };
        } catch (e) {
            console.error('[Timeline] Capture failed:', e.message);
            return null;
        }
    }

    /**
     * Remove screenshots antigos quando excede maxScreenshots.
     */
    cleanup() {
        const files = readdirSync(this.directory)
            .filter(f => f.startsWith('screenshot-'))
            .sort();

        while (files.length > this.maxScreenshots) {
            const oldest = files.shift();
            unlinkSync(join(this.directory, oldest));
        }
    }

    /**
     * Lista todos os screenshots disponíveis.
     */
    list() {
        return readdirSync(this.directory)
            .filter(f => f.startsWith('screenshot-'))
            .sort()
            .reverse()
            .map(filename => ({
                filename,
                timestamp: this.parseTimestamp(filename),
                url: `/api/timeline/${filename}`
            }));
    }

    /**
     * Extrai timestamp do nome do arquivo.
     */
    parseTimestamp(filename) {
        const match = filename.match(/screenshot-(.+)\.jpg/);
        if (match) {
            return match[1].replace(/-/g, (m, i) => i < 10 ? m : ':').replace('T', 'T');
        }
        return null;
    }

    /**
     * Inicia captura periódica.
     */
    start(cdpConnection, getSnapshotHash) {
        this.timer = setInterval(async () => {
            const hash = getSnapshotHash();
            if (hash && cdpConnection) {
                await this.capture(cdpConnection, hash);
            }
        }, this.captureInterval);
    }

    /**
     * Para captura periódica.
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

export const screenshotTimeline = new ScreenshotTimeline();
```

### Endpoints REST

```
GET    /api/timeline             → Lista screenshots com timestamps
GET    /api/timeline/:filename   → Serve imagem JPEG específica
DELETE /api/timeline             → Limpa todos os screenshots
POST   /api/timeline/capture     → Força captura manual
```

### UI Timeline (timeline-panel.js)

```javascript
class TimelinePanel {
    constructor(container) {
        this.container = container;
    }

    async load() {
        const response = await fetchWithAuth('/api/timeline');
        const screenshots = await response.json();

        this.container.innerHTML = `
            <div class="timeline-grid">
                ${screenshots.map(s => `
                    <div class="timeline-item" data-filename="${s.filename}">
                        <img src="${s.url}" loading="lazy" alt="Screenshot" />
                        <span class="timeline-time">${this.formatTime(s.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Click to expand
        this.container.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showFullscreen(item.dataset.filename);
            });
        });
    }

    showFullscreen(filename) {
        // Modal overlay with full-size screenshot
    }
}
```

### CSS da Timeline

```css
.timeline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-sm);
    padding: var(--space-md);
}

.timeline-item {
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: transform var(--transition-fast);
}

.timeline-item:hover {
    transform: scale(1.05);
}

.timeline-item img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
}

.timeline-time {
    display: block;
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    padding: 4px;
}
```

### Variáveis de Ambiente

```env
SCREENSHOT_ENABLED=false           # Ativar captura automática
SCREENSHOT_INTERVAL=60000          # Intervalo em ms (default: 60s)
SCREENSHOT_MAX=100                 # Máximo de screenshots armazenados
```

## 🧪 Testes de Verificação

- [x] Screenshot capturado e salvo em disco
- [x] Cleanup remove arquivos antigos quando > maxScreenshots
- [x] API lista screenshots em ordem reversa (mais recente primeiro)
- [x] Imagens JPEG servidas corretamente via REST
- [x] Captura manual via POST funciona
- [x] Timer não causa leak de memória
- [x] Desativado por padrão (`SCREENSHOT_ENABLED=false`)

## ✅ Critérios de Aceitação

- [x] Captura automática funcional (change-based + interval)
- [x] Timeline visual com thumbnails no mobile
- [x] Click para expandir screenshot em full-screen
- [x] Cleanup automático (storage bounded)
- [x] API REST completa (list, get, delete, capture)
- [x] Zero impacto no polling loop (async, non-blocking)
