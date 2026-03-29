// @ts-check
/**
 * Local AI supervisor backed by OmniRoute for safe auto-approvals.
 *
 * @module supervisor
 */

const DEFAULT_BASE_URL = process.env.OMNIROUTE_SUPERVISOR_BASE_URL
    || process.env.OPENAI_BASE_URL
    || 'http://127.0.0.1:20128/v1';
const DEFAULT_MODEL = process.env.OMNIROUTE_SUPERVISOR_MODEL || 'if/kimi-k2-thinking';
const DEFAULT_API_KEY = process.env.OMNIROUTE_SUPERVISOR_API_KEY
    || process.env.OPENAI_API_KEY
    || 'sk_omniroute';
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_SUPERVISOR_TIMEOUT_MS || '8000', 10);

/**
 * @param {string} url
 * @returns {string}
 */
function normalizeBaseUrl(url) {
    const trimmed = String(url || '').trim().replace(/\/+$/, '');
    if (!trimmed) return 'http://127.0.0.1:20128/v1';
    return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
}

/**
 * @param {string} baseUrl
 * @returns {string}
 */
function buildChatCompletionsUrl(baseUrl) {
    return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function extractText(value) {
    if (typeof value === 'string') {
        return value.trim();
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => extractText(item))
            .filter(Boolean)
            .join(' ')
            .trim();
    }

    if (value && typeof value === 'object') {
        if ('text' in value && typeof value.text === 'string') {
            return value.text.trim();
        }

        if ('content' in value) {
            return extractText(value.content);
        }
    }

    return '';
}

/**
 * @param {any} payload
 * @returns {string}
 */
function extractCompletionText(payload) {
    const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
    const choiceText = extractText(choice?.message?.content || choice?.text || '');
    if (choiceText) return choiceText;

    const outputText = extractText(payload?.output_text || payload?.output || '');
    if (outputText) return outputText;

    return '';
}

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
        this.provider = 'omniroute';
        this.enabled = String(
            process.env.OMNIROUTE_SUPERVISOR_ENABLED || process.env.OLLAMA_SUPERVISOR_ENABLED || ''
        ).toLowerCase() === 'true';
        this.baseUrl = normalizeBaseUrl(DEFAULT_BASE_URL);
        this.url = buildChatCompletionsUrl(this.baseUrl);
        this.model = DEFAULT_MODEL;
        this.apiKey = DEFAULT_API_KEY;
        this.timeoutMs = Number.isFinite(DEFAULT_TIMEOUT_MS) && DEFAULT_TIMEOUT_MS > 0
            ? DEFAULT_TIMEOUT_MS
            : 8000;
    }

    /**
     * @returns {{enabled: boolean, provider: string, baseUrl: string, url: string, model: string, timeoutMs: number}}
     */
    getStatus() {
        return {
            enabled: this.enabled,
            provider: this.provider,
            baseUrl: this.baseUrl,
            url: this.url,
            model: this.model,
            timeoutMs: this.timeoutMs
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

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            signal: AbortSignal.timeout(this.timeoutMs),
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: [
                            'Voce e um supervisor local extremamente conservador.',
                            'Responda apenas com APPROVE ou DENY.',
                            'Aprovacao so eh permitida para comandos claramente de leitura, lint, teste ou diff.',
                            'Se houver qualquer ambiguidade, responda DENY.'
                        ].join(' ')
                    },
                    {
                        role: 'user',
                        content: [
                            'Resumo do pedido pendente:',
                            commandText || '(sem contexto textual disponivel)'
                        ].join('\n')
                    }
                ],
                temperature: 0,
                max_tokens: 12,
                stream: false
            })
        });

        if (!response.ok) {
            const details = await response.text().catch(() => '');
            const summary = details ? `: ${details.slice(0, 240)}` : '';
            throw new Error(`OmniRoute supervisor request failed with status ${response.status}${summary}`);
        }

        const result = await response.json();
        const text = extractCompletionText(result).toUpperCase();
        const approved = text.startsWith('APPROVE');

        return {
            approved,
            source: 'omniroute',
            reason: approved ? 'omniroute-approved' : 'omniroute-denied',
            commandText
        };
    }
}

export const aiSupervisor = new AISupervisor();
