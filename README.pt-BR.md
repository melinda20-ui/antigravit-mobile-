<div align="center">

# 📱 OmniAntigravity Remote Chat

### Sua sessão de IA não precisa acabar quando você sai da mesa.

<br/>

<img src="assets/hero-banner.png" alt="Controle sua IA do sofá" width="700" />

<br/>
<br/>

![Version](https://img.shields.io/badge/version-0.5.3-6366f1) ![Node](https://img.shields.io/badge/node-22%2B-10b981) ![CI](https://github.com/diegosouzapw/OmniAntigravityRemoteChat/actions/workflows/ci.yml/badge.svg) ![License](https://img.shields.io/badge/license-GPL--3.0-blue)

[![npm](https://img.shields.io/npm/v/omni-antigravity-remote-chat?color=cc3534&logo=npm)](https://www.npmjs.com/package/omni-antigravity-remote-chat) [![npm downloads](https://img.shields.io/npm/dm/omni-antigravity-remote-chat?color=blue&logo=npm)](https://www.npmjs.com/package/omni-antigravity-remote-chat) [![Docker](https://img.shields.io/docker/pulls/diegosouzapw/omni-antigravity-remote-chat?color=2496ED&logo=docker&logoColor=white)](https://hub.docker.com/r/diegosouzapw/omni-antigravity-remote-chat)

**Espelhe o chat da sua IA no Antigravity diretamente no celular, em tempo real.**
<br/>
**Envie mensagens. Troque modelos. Gerencie janelas. Tudo pelo navegador mobile.**

[Começar](#-começar) · [Screenshots](#-veja-em-ação) · [Como Funciona](#-como-funciona) · [Docker](https://hub.docker.com/r/diegosouzapw/omni-antigravity-remote-chat) · [npm](https://www.npmjs.com/package/omni-antigravity-remote-chat)

🌐 **Disponível em:** 🇺🇸 [English](README.md) | 🇧🇷 Português (Brasil) | 🇪🇸 [Español](README.es.md) | 🇫🇷 [Français](README.fr.md) | 🇮🇹 [Italiano](README.it.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [中文 (简体)](README.zh-CN.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇳 [हिन्दी](README.in.md) | 🇹🇭 [ไทย](README.th.md) | 🇺🇦 [Українська](README.uk-UA.md) | 🇸🇦 [العربية](README.ar.md) | 🇯🇵 [日本語](README.ja.md) | 🇻🇳 [Tiếng Việt](README.vi.md) | 🇧🇬 [Български](README.bg.md) | 🇩🇰 [Dansk](README.da.md) | 🇫🇮 [Suomi](README.fi.md) | 🇮🇱 [עברית](README.he.md) | 🇭🇺 [Magyar](README.hu.md) | 🇮🇩 [Bahasa Indonesia](README.id.md) | 🇰🇷 [한국어](README.ko.md) | 🇲🇾 [Bahasa Melayu](README.ms.md) | 🇳🇱 [Nederlands](README.nl.md) | 🇳🇴 [Norsk](README.no.md) | 🇵🇹 [Português (Portugal)](README.pt.md) | 🇷🇴 [Română](README.ro.md) | 🇵🇱 [Polski](README.pl.md) | 🇸🇰 [Slovenčina](README.sk.md) | 🇸🇪 [Svenska](README.sv.md) | 🇵🇭 [Filipino](README.phi.md)

</div>

<br/>

## 😤 O Problema

Você está no meio de uma sessão de codificação assistida por IA. O Claude está gerando código, o Gemini está revisando sua arquitetura. Então seu telefone toca, alguém precisa de você na cozinha, ou você só quer ir para o sofá.

**Suas opções hoje:**

- ❌ Voltar para a mesa toda vez que a IA responde
- ❌ Tentar ler o monitor do outro lado da sala
- ❌ Copiar e colar em outro app mobile (perdendo o contexto)
- ❌ Simplesmente... parar de codar

**Tem que ter um jeito melhor.**

## ✅ A Solução

OmniAntigravity espelha **todo o chat de IA do Antigravity** no seu celular — em tempo real, com interação completa. Leia respostas, envie mensagens de acompanhamento, troque modelos de IA, gerencie múltiplas janelas do editor. Tudo pelo navegador do celular.

```bash
npx omni-antigravity-remote-chat
```

É isso. Abra a URL no celular. Você está dentro. 🚀

---

## 📸 Veja em Ação

<div align="center">

|                 Interface Principal                  |                   Seleção de Modelo                    |                   Pronto para Chat                    |
| :--------------------------------------------------: | :----------------------------------------------------: | :---------------------------------------------------: |
| <img src="assets/screenshot-main.png" width="280" /> | <img src="assets/screenshot-models.png" width="280" /> | <img src="assets/screenshot-input.png" width="280" /> |
|        UI dark premium com sync em tempo real        |           Alterne entre Gemini, Claude, GPT            |            Envie mensagens do seu celular             |

</div>

---

## ⚡ Começar

### Um comando — zero configuração:

```bash
npx omni-antigravity-remote-chat
```

### Ou instale globalmente:

```bash
npm install -g omni-antigravity-remote-chat
omni-chat
```

### Ou rode com Docker:

```bash
docker run -d --name omni-chat \
  --network host \
  -e APP_PASSWORD=sua_senha \
  diegosouzapw/omni-antigravity-remote-chat:latest
```

### Pré-requisito

Inicie o Antigravity em modo debug (configuração única):

```bash
antigravity . --remote-debugging-port=7800
```

> 💡 **Dica:** Adicione `alias agd='antigravity . --remote-debugging-port=7800'` ao seu `~/.bashrc`

---

## 🏆 Por Que Desenvolvedores Escolhem Isso

|     | Recurso                    | Detalhes                                                                   |
| --- | -------------------------- | -------------------------------------------------------------------------- |
| 🛋️  | **Code de qualquer lugar** | Leia e responda chats de IA do sofá, cama ou cozinha                       |
| 🪟  | **Multi-janela**           | Alterne entre múltiplas instâncias do Antigravity de um só celular         |
| 🔄  | **Sync em tempo real**     | < 100ms de latência via WebSocket — atualizações aparecem instantaneamente |
| 🤖  | **Troca de modelo**        | Alterne entre Gemini, Claude, GPT de um dropdown mobile                    |
| 🤖  | **Remote Autonomy**        | Auto-detect and 1-tap accept/reject CLI instructions remotely            |
| 📱  | **Telegram Alerts**        | Get push notifications for Blocks, Task completion and Pending actions   |
| 📋  | **Histórico de chat**      | Navegue e retome conversas anteriores no celular                           |
| 🔒  | **Seguro por padrão**      | HTTPS, autenticação por senha, sessões por cookie, auto-auth na LAN        |
| 🌐  | **Acesso remoto**          | Suporte a ngrok com QR code — acesse de qualquer lugar                     |
| 🐳  | **Docker pronto**          | Deploy com um único comando                                                |
| ♻️  | **Código modular**         | Arquitetura limpa com tipagem JSDoc (`config`, `state`, `utils`, `cdp`)    |

---

## 📱 Como Funciona

```
┌─────────────┐    CDP (7800)    ┌──────────────┐    HTTPS/WS (4747)    ┌─────────────┐
│ Antigravity  │ ◄──────────────► │  Node Server  │ ◄──────────────────► │   Celular    │
│  (Desktop)   │    DOM snapshot   │  (server.js)  │    espelho + controle│  (Browser)   │
└─────────────┘                  └──────────────┘                      └─────────────┘
```

O servidor se conecta ao Antigravity via **Chrome DevTools Protocol (CDP)**, captura o DOM do chat em tempo real e transmite para o celular via WebSocket. Ações no celular (enviar mensagens, trocar modelos) são executadas de volta no desktop via CDP.

**Zero impacto no seu desktop** — o espelhamento é somente leitura até você interagir. Sem plugins, sem extensões, sem modificações no Antigravity.

---

## 🪟 Gerenciamento Multi-Janela

Gerencie **múltiplas instâncias do Antigravity** de um único celular:

- **Seletor de Janela** — Toque 🖥️ para ver todas as janelas abertas do Antigravity
- **Troca Instantânea** — Selecione qualquer janela, espelha em 2 segundos
- **Filtro Inteligente** — Mostra apenas janelas reais do editor (esconde Configurações, Launchpad)
- **Abrir Janelas** — Crie novas instâncias do Antigravity direto do celular

---

## 🚀 Modos de Lançamento

| Recurso         | Git Clone             | NPM Global                          | Docker           |
| --------------- | --------------------- | ----------------------------------- | ---------------- |
| Servidor básico | `npm start`           | `omni-chat`                         | `docker run ...` |
| QR code         | `npm run start:local` | `omni-chat` (mostra URL)            | —                |
| Túnel ngrok     | `npm run start:web`   | `omni-chat` + `npx ngrok http 4747` | —                |
| Setup SSL       | `npm run setup:ssl`   | Manual com `mkcert`                 | Não necessário   |

<details>
<summary>📖 Detalhes completos dos modos de lançamento</summary>

### Git Clone (controle total)

```bash
npm start              # Iniciar servidor diretamente
npm run start:local    # Iniciar com QR code para acesso Wi-Fi
npm run start:web      # Iniciar com túnel ngrok para acesso pela internet
npm run setup:ssl      # Gerar certificados HTTPS confiáveis
```

### ngrok (Acesso Remoto)

```bash
# Terminal 1
omni-chat

# Terminal 2
npx ngrok http 4747
```

> **Integração completa com ngrok** (túnel automático + QR code) disponível via `npm run start:web` com `NGROK_AUTHTOKEN` no `.env`.

### Setup SSL

```bash
npm run setup:ssl
```

Instala automaticamente o [mkcert](https://github.com/FiloSottile/mkcert), cria uma CA local e gera certificados confiáveis → cadeado verde 🔒

</details>

---

## 🔑 Configuração

```bash
cp .env.example .env
```

| Variável          | Padrão          | Descrição                          |
| ----------------- | --------------- | ---------------------------------- |
| `APP_PASSWORD`    | `antigravity`   | Senha de autenticação              |
| `PORT`            | `4747`          | Porta do servidor                  |
| `COOKIE_SECRET`   | _(auto-gerado)_ | Segredo para assinatura de cookies |
| `AUTH_SALT`       | _(auto-gerado)_ | Salt adicional para tokens de auth |
| `NGROK_AUTHTOKEN` | _(opcional)_    | Para acesso remoto via ngrok       |

---

## 🛠️ Solução de Problemas

| Problema             | Solução                                                          |
| -------------------- | ---------------------------------------------------------------- |
| "CDP not found"      | Inicie o Antigravity com `--remote-debugging-port=7800`          |
| "EADDRINUSE"         | Altere `PORT` no `.env`, ou encerre o processo na porta          |
| Celular não conecta  | Verifique se estão na mesma rede Wi-Fi e confira o firewall      |
| "Syncing..." travado | Aguarde 2-3s para os contextos CDP carregarem após trocar janela |

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── server.js              # Servidor principal (Express + WS + ações CDP)
│   ├── config.js              # Constantes, variáveis de ambiente, IDs de containers
│   ├── state.js               # Estado compartilhado + definições de tipos JSDoc
│   ├── cdp/
│   │   └── connection.js      # Descoberta e conexão CDP
│   └── utils/
│       ├── network.js         # getLocalIP, isLocalRequest, getJson
│       ├── process.js         # killPortProcess, launchAntigravity
│       └── hash.js            # Utilitário de hash
├── public/                    # Interface mobile do chat
├── launcher.js                # Launcher com QR code + ngrok
├── scripts/                   # SSL, instaladores de menu de contexto
├── test/                      # Suíte de testes de validação
├── Dockerfile                 # Suporte Docker
└── .github/workflows/         # CI + auto-release + Docker Hub
```

---

## 📊 Histórico de Estrelas

<a href="https://star-history.com/#diegosouzapw/OmniAntigravityRemoteChat&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=diegosouzapw/OmniAntigravityRemoteChat&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=diegosouzapw/OmniAntigravityRemoteChat&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=diegosouzapw/OmniAntigravityRemoteChat&type=Date" />
 </picture>
</a>

---

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/recurso-incrivel`)
3. Faça commit das mudanças (`git commit -m 'Adiciona recurso incrível'`)
4. Faça push para a branch (`git push origin feature/recurso-incrivel`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes detalhadas.

---

## 🙏 Agradecimentos

Agradecimento especial a **[Krishna Kanth B](https://github.com/krishnakanthb13)** — o criador original do conceito de chat mobile para Windsurf que inspirou este projeto. OmniAntigravity expande essa base com gerenciamento multi-janela, tratamento robusto de CDP, empacotamento NPM/Docker e uma UI mobile-first premium.

---

## 📄 Licença

GPL-3.0 — veja [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  <sub>Feito com ❤️ para desenvolvedores que codam de qualquer lugar</sub>
  <br/>
  <sub><a href="https://github.com/diegosouzapw/OmniAntigravityRemoteChat">github.com/diegosouzapw/OmniAntigravityRemoteChat</a></sub>
</div>
