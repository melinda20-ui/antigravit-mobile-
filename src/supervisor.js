// @ts-check
/**
 * Local AI supervisor backed by Ollama for safe auto-approvals.
 *
 * @module supervisor
 */

const DEFAULT_URL = process.env.OLLAMA_SUPERVISOR_URL || 'http://127.0.0.1:11434/api/generate';
const DEFAULT_MODEL = process.env.OLLAMA_SUPERVISOR_MODEL || 'llama3.2';

/**
 * Extract a compact command summary from the pending-action snapshot.
 *
 * @param {string} html
 * @returns {string}
 */
export function extractPendingCommand(html) {
    const plain = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const runIndex = plain.toLowerCase().indexOf('run command');
    if (runIndex === -1) return '';

    return plain.slice(runIndex, runIndex + 700);
}

/**
 * Conservative heuristic gate. If it says "unsafe", we do not auto-approve
 * even if the LLM is optimistic.
 *
 * @param {string} commandText
 * @returns {{safe: boolean, reason: string}}
 */
export function evaluateCommandHeuristics(commandText) {
    const sample = commandText.toLowerCase();
    const riskyPatterns = [
        /\brm\b/,
        /\bdel\b/,
        /\bshutdown\b/,
        /\breboot\b/,
        /\bkill\b/,
        /\bmkfs\b/,
        /\bformat\b/,
        /\bsudo\b/,
        /\bchmod\b/,
        /\bchown\b/,
        /\bpush\b/,
        /\bpublish\b/,
        /\bdeploy\b/,
        /\bcurl\b.*\|/,
        /\bwget\b.*\|/,
        />\s*\/dev\//,
        /\bgit\s+reset\b/,
        /\bgit\s+clean\b/,
        /\bdrop\s+table\b/
    ];

    if (riskyPatterns.some((pattern) => pattern.test(sample))) {
        return { safe: false, reason: 'heuristic-risky-command' };
    }

    const safePatterns = [
        /\bgit\s+status\b/,
        /\bgit\s+diff\b/,
        /\bnpm\s+test\b/,
        /\bnpm\s+run\s+(lint|test)\b/,
        /\bpnpm\s+(lint|test)\b/,
        /\byarn\s+(lint|test)\b/,
        /\bpytest\b/,
        /\bruff\b/,
        /\bmypy\b/,
        /\bls\b/,
        /\bcat\b/,
        /\bsed\b/,
        /\bnode\s+--check\b/
    ];

    if (safePatterns.some((pattern) => pattern.test(sample))) {
        return { safe: true, reason: 'heuristic-safe-command' };
    }

    return { safe: false, reason: 'heuristic-unknown-command' };
}

export class AISupervisor {
    constructor() {
        this.enabled = String(process.env.OLLAMA_SUPERVISOR_ENABLED || '').toLowerCase() === 'true';
        this.url = DEFAULT_URL;
        this.model = DEFAULT_MODEL;
    }

    /**
     * @returns {{enabled: boolean, url: string, model: string}}
     */
    getStatus() {
        return {
            enabled: this.enabled,
            url: this.url,
            model: this.model
        };
    }

    /**
     * @param {{html: string}} payload
     * @returns {Promise<{approved: boolean, source: string, reason: string, commandText: string}>}
     */
    async shouldApprove(payload) {
        const commandText = extractPendingCommand(payload.html);
        const heuristic = evaluateCommandHeuristics(commandText);

        if (!this.enabled) {
            return {
                approved: false,
                source: 'disabled',
                reason: 'supervisor-disabled',
                commandText
            };
        }

        if (!heuristic.safe) {
            return {
                approved: false,
                source: 'heuristic',
                reason: heuristic.reason,
                commandText
            };
        }

        const prompt = [
            'Voce e um supervisor local extremamente conservador.',
            'Responda apenas com APPROVE ou DENY.',
            'Aprovacao so eh permitida para comandos claramente de leitura, lint, teste ou diff.',
            'Se houver qualquer ambiguidade, responda DENY.',
            '',
            'Resumo do pedido pendente:',
            commandText || '(sem contexto textual disponivel)'
        ].join('\n');

        const response = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama supervisor request failed with status ${response.status}`);
        }

        const result = await response.json();
        const text = String(result.response || '').trim().toUpperCase();
        const approved = text.startsWith('APPROVE');

        return {
            approved,
            source: 'ollama',
            reason: approved ? 'ollama-approved' : 'ollama-denied',
            commandText
        };
    }
}

export const aiSupervisor = new AISupervisor();
