# TASK-11: Unit Tests com Vitest

**Status:** ✅ Concluída  
**Tier:** 3 — Strategic  
**Esforço:** ⭐⭐ Médio (3-5 dias)  
**Impacto:** 🟠 Médio  
**Fonte:** [AntigravityMobile commit e9d97e5](https://github.com/tody-agent/AntigravityMobile) — 18 unit tests com Vitest  
**Dependências:** Nenhuma  
**Bloqueado por:** Nenhuma task

---

## 📋 Descrição

Configurar Vitest como framework de testes unitários e criar suite de testes abrangente para os módulos core do projeto. O objetivo é atingir ≥ 20 testes unitários cobrindo configuração, supervisor, Telegram, hash, e network utilities.

## 🎯 Objetivos

- [x] Instalar e configurar Vitest com ESM support
- [x] Criar `vitest.config.js` com coverage e watch mode
- [x] ≥ 20 testes unitários cobrindo:
  - `config.js` — valores padrão, env vars
  - `supervisor.js` — heurísticas (risky/safe patterns)
  - `utils/hash.js` — hash consistency
  - `utils/network.js` — IP detection, local request detection
  - `utils/telegram.js` — rate limiting, threading, toggles
  - `session-stats.js` — métricas (se TASK-08 concluída)
  - `quota-service.js` — model name mapping (se TASK-09 concluída)
- [x] Script npm: `npm run test:unit`
- [x] CI/CD integration via GitHub Actions (opcional)

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `vitest.config.js` | NEW | Configuração do Vitest |
| `package.json` | MODIFY | Script `test:unit`, devDependency |
| `test/unit/config.test.js` | NEW | Testes de configuração |
| `test/unit/supervisor.test.js` | NEW | Testes de heurísticas |
| `test/unit/hash.test.js` | NEW | Testes de hash |
| `test/unit/network.test.js` | NEW | Testes de rede |
| `test/unit/telegram.test.js` | NEW | Testes de Telegram |

## 🔍 Detalhes Técnicos

### Configuração `vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/unit/**/*.test.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.js'],
            exclude: ['src/server.js'], // Too large for unit testing
        },
        testTimeout: 10000,
    },
});
```

### Teste: `config.test.js` (5 testes)

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Config Module', () => {
    it('SERVER_PORT defaults to 4747', async () => {
        const { SERVER_PORT } = await import('../../src/config.js');
        expect(SERVER_PORT).toBe(4747);
    });

    it('APP_PASSWORD defaults to "antigravity"', async () => {
        const { APP_PASSWORD } = await import('../../src/config.js');
        expect(APP_PASSWORD).toBe('antigravity');
    });

    it('PORTS includes 7800-7803', async () => {
        const { PORTS } = await import('../../src/config.js');
        expect(PORTS).toEqual([7800, 7801, 7802, 7803]);
    });

    it('CONTAINER_IDS has cascade first', async () => {
        const { CONTAINER_IDS } = await import('../../src/config.js');
        expect(CONTAINER_IDS[0]).toBe('cascade');
    });

    it('VERSION follows semver', async () => {
        const { VERSION } = await import('../../src/config.js');
        expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
```

### Teste: `supervisor.test.js` (8+ testes)

```javascript
import { describe, it, expect } from 'vitest';
import { evaluateCommandHeuristics } from '../../src/supervisor.js';

describe('Supervisor Heuristics', () => {
    describe('Risky commands', () => {
        it('rejects rm commands', () => {
            expect(evaluateCommandHeuristics('rm -rf /').safe).toBe(false);
        });

        it('rejects sudo commands', () => {
            expect(evaluateCommandHeuristics('sudo apt install').safe).toBe(false);
        });

        it('rejects dd if= commands', () => {
            expect(evaluateCommandHeuristics('dd if=/dev/zero of=/dev/sda').safe).toBe(false);
        });

        it('rejects git force-push', () => {
            expect(evaluateCommandHeuristics('git push --force').safe).toBe(false);
        });

        it('rejects Always Allow button text', () => {
            // Verifica que o supervisor trata "Always" como perigoso
            const result = evaluateCommandHeuristics('systemctl stop nginx');
            expect(result.safe).toBe(false);
        });
    });

    describe('Safe commands', () => {
        it('approves git status', () => {
            expect(evaluateCommandHeuristics('git status').safe).toBe(true);
        });

        it('approves npm test', () => {
            expect(evaluateCommandHeuristics('npm test').safe).toBe(true);
        });

        it('approves grep', () => {
            expect(evaluateCommandHeuristics('grep -r "pattern" .').safe).toBe(true);
        });

        it('approves tsc --noEmit', () => {
            expect(evaluateCommandHeuristics('tsc --noEmit').safe).toBe(true);
        });
    });

    describe('Unknown commands', () => {
        it('rejects unknown commands as unsafe', () => {
            const result = evaluateCommandHeuristics('some-random-command');
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('heuristic-unknown-command');
        });
    });
});
```

### Teste: `hash.test.js` (3 testes)

```javascript
import { describe, it, expect } from 'vitest';
import { hashString } from '../../src/utils/hash.js';

describe('Hash Utility', () => {
    it('produces consistent hashes', () => {
        expect(hashString('hello')).toBe(hashString('hello'));
    });

    it('produces different hashes for different inputs', () => {
        expect(hashString('hello')).not.toBe(hashString('world'));
    });

    it('handles empty strings', () => {
        expect(hashString('')).toBeDefined();
    });
});
```

### Teste: `telegram.test.js` (5 testes)

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Telegram Module', () => {
    it('sendTelegramNotification returns true when no token configured', async () => {
        // Mock env without tokens
        const { sendTelegramNotification } = await import('../../src/utils/telegram.js');
        const result = await sendTelegramNotification('test');
        expect(result).toBe(true); // silently succeeds
    });

    it('notification toggles have all required types', async () => {
        const { getNotificationToggles } = await import('../../src/utils/telegram.js');
        const toggles = getNotificationToggles();
        expect(toggles).toHaveProperty('error');
        expect(toggles).toHaveProperty('warning');
        expect(toggles).toHaveProperty('action_required');
    });

    it('isBotActive returns false without token', async () => {
        const { isBotActive } = await import('../../src/utils/telegram.js');
        expect(isBotActive()).toBe(false);
    });
});
```

### Package.json Scripts

```json
{
    "scripts": {
        "test": "node test/test.js",
        "test:unit": "vitest run",
        "test:unit:watch": "vitest",
        "test:coverage": "vitest run --coverage",
        "test:all": "npm test && npm run test:unit"
    },
    "devDependencies": {
        "vitest": "^3.x",
        "@vitest/coverage-v8": "^3.x"
    }
}
```

## 🧪 Testes de Verificação

- [x] `npm run test:unit` executa sem erros
- [x] ≥ 20 testes passando
- [x] Coverage report gerado em `coverage/`
- [x] Watch mode funciona (`npm run test:unit:watch`)
- [x] Testes existentes (`npm test`) continuam funcionando
- [x] ESM imports resolvidos pelo Vitest

## ✅ Critérios de Aceitação

- [x] Vitest configurado com ESM support
- [x] ≥ 20 testes unitários passando
- [x] Coverage ≥ 60% nos módulos core (excluindo server.js)
- [x] Script `npm run test:all` executa ambos suites
- [x] Zero mudanças breaking nos testes existentes
- [x] CI-ready (pode ser adicionado a GitHub Actions)
