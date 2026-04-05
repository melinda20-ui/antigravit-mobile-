# TASK-09: Model Quota Service

**Status:** ✅ Concluída  
**Tier:** 3 — Strategic  
**Esforço:** ⭐⭐⭐⭐ Muito Alto (5-7 dias)  
**Impacto:** 🔴 Alto  
**Fonte:** [AntigravityMobile/quota-service.mjs](https://github.com/tody-agent/AntigravityMobile) (403 linhas)  
**Dependências:** TASK-05 (Telegram — para `/quota`)  
**Bloqueado por:** Nenhuma task

---

## 📋 Descrição

Implementar serviço de monitoramento de quota de modelos do Antigravity. O serviço descobre automaticamente o Language Server local, extrai credenciais CSRF, e consulta a API `GetUserStatus` para obter dados de uso por modelo.

## 🎯 Objetivos

- [x] Criar módulo `src/quota-service.js` com descoberta automática do Language Server
- [x] Implementar extração de CSRF token do diretório de dados local
- [x] Query à API `GetUserStatus` do Language Server
- [x] Parsing do response protobuf/JSON para extrair quotas por modelo
- [x] Mapeamento de nomes internos → nomes amigáveis de modelos
- [x] Endpoint REST: `GET /api/quota`
- [x] Polling periódico (configurável, default: 5min)
- [x] Integração com Telegram: comando `/quota`
- [x] Widget visual no mobile com barras de progresso
- [x] Alertas automáticos quando quota > 80%

## 📁 Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/quota-service.js` | NEW | Motor principal de monitoramento de quota |
| `src/config.js` | MODIFY | Novas env vars: `QUOTA_ENABLED`, `QUOTA_POLL_INTERVAL` |
| `src/server.js` | MODIFY | Endpoint REST + polling integration |
| `src/utils/telegram.js` | MODIFY | Comando `/quota` com barras visuais |
| `public/js/app.js` | MODIFY | Widget de quota na UI mobile |

## 🔍 Detalhes Técnicos

### Descoberta do Language Server (cross-platform)

```javascript
/**
 * Encontra o processo do Language Server e extrai porta + PID.
 * 
 * Linux: usa `ps aux | grep language_server`
 * macOS: usa `ps aux | grep language_server`
 * Windows: usa PowerShell (referência do AntigravityMobile)
 */
async function discoverLanguageServer() {
    const platform = process.platform;
    
    if (platform === 'win32') {
        // PowerShell: Get-Process -Name "language_server*"
        // + Get-NetTCPConnection para porta
    } else {
        // Linux/macOS: ps aux + lsof -i -P
        const { stdout } = await execAsync(
            'ps aux | grep -i "language.server" | grep -v grep'
        );
        // Parse PID e porta do output
    }
}
```

### Extração de CSRF Token

```javascript
/**
 * Extrai CSRF token do diretório de dados do Antigravity.
 * Localizado em: ~/.antigravity/data/ ou ~/.config/Antigravity/User/
 */
async function extractCSRFToken() {
    const possiblePaths = [
        join(homedir(), '.antigravity', 'data', 'machineid'),
        join(homedir(), '.config', 'Antigravity', 'User', 'machineid'),
        join(homedir(), 'AppData', 'Roaming', 'Antigravity', 'User', 'machineid'),
    ];
    
    for (const p of possiblePaths) {
        if (existsSync(p)) {
            return readFileSync(p, 'utf8').trim();
        }
    }
    return null;
}
```

### Query à API GetUserStatus

```javascript
const API_ENDPOINT = '/exa.language_server_pb.LanguageServerService/GetUserStatus';

async function fetchQuotaData(port, csrfToken) {
    const url = `https://127.0.0.1:${port}${API_ENDPOINT}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({}),
        // Ignorar certificado self-signed
        agent: new https.Agent({ rejectUnauthorized: false })
    });
    return response.json();
}
```

### Model Name Mapping (atualizado Mar 2026)

```javascript
const MODEL_NAMES = {
    'MODEL_PLACEHOLDER_M12': 'Claude Opus 4.6',
    'MODEL_CLAUDE_4_5_SONNET': 'Claude Sonnet 4.6',
    'MODEL_CLAUDE_4_5_SONNET_THINKING': 'Claude Sonnet 4.6 Thinking',
    'MODEL_PLACEHOLDER_M18': 'Gemini 3 Flash',
    'MODEL_PLACEHOLDER_M7': 'Gemini 3.1 Pro High',
    'MODEL_PLACEHOLDER_M8': 'Gemini 3.1 Pro Low',
    'MODEL_PLACEHOLDER_M9': 'Gemini 3.1 Pro Image',
    'MODEL_OPENAI_GPT_OSS_120B_MEDIUM': 'GPT-OSS 120B',
};
```

### Formato de Response

```json
{
    "models": [
        {
            "id": "MODEL_CLAUDE_4_5_SONNET",
            "name": "Claude Sonnet 4.6",
            "used": 142,
            "limit": 500,
            "usagePercent": 28.4,
            "resetTime": "2026-03-30T00:00:00Z",
            "status": "ok"
        }
    ],
    "totalModels": 8,
    "criticalModels": 0,
    "lastUpdated": "2026-03-29T07:45:00Z"
}
```

### Variáveis de Ambiente

```env
QUOTA_ENABLED=false              # Ativar monitor de quota
QUOTA_POLL_INTERVAL=300000       # 5 minutos em ms
```

### Alerta Automático (> 80%)

```javascript
if (model.usagePercent > 80) {
    sendTypedNotification('warning', 
        `⚠️ <b>${model.name}</b> está em ${model.usagePercent}% da quota!\n` +
        `Usado: ${model.used}/${model.limit}\n` +
        `Reset: ${model.resetTime}`
    );
}
```

### Telegram `/quota`

```
📊 Model Quota Status
─────────────────────
Claude Sonnet 4.6
▓▓▓▓▓▓▓▓░░░ 72% (360/500)

Claude Opus 4.6
▓▓▓░░░░░░░░ 28% (42/150)

Gemini 3.1 Pro High
▓░░░░░░░░░░ 8% (24/300)

⏰ Reset: amanhã 00:00
🔄 Última atualização: 07:45
```

## ⚠️ Desafios e Riscos

1. **Cross-platform**: O processo de descoberta do Language Server difere por OS
2. **CSRF Token**: O Antigravity pode mudar a localização do token entre versões
3. **Self-signed HTTPS**: O Language Server usa HTTPS com certificado auto-assinado
4. **API não documentada**: O endpoint `GetUserStatus` é interno e pode mudar
5. **Protobuf response**: O response pode ser protobuf em vez de JSON

### Mitigações
- Lazy loading: serviço não inicializa se `QUOTA_ENABLED=false`
- Error handling robusto com fallback graceful
- Cache de 5min para evitar sobrecarga do Language Server
- Log detalhado para debugging

## 🧪 Testes de Verificação

- [x] Descoberta do Language Server funciona em Linux
- [x] CSRF token extraído corretamente
- [x] API query retorna dados de quota
- [x] Model names mapeados corretamente
- [x] Alerta disparado quando quota > 80%
- [x] Telegram `/quota` formata barras de progresso
- [x] Widget mobile atualiza via WebSocket
- [x] Serviço não causa crash quando Language Server indisponível

## ✅ Critérios de Aceitação

- [x] Quota de pelo menos 3 modelos exibida corretamente
- [x] Alertas automáticos quando > 80%
- [x] Comando Telegram `/quota` funcional
- [x] Widget compacto na UI mobile
- [x] Zero impacto no polling loop (executa em background)
- [x] Desativado por padrão (`QUOTA_ENABLED=false`)
