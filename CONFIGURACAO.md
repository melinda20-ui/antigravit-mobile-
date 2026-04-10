# 📱 Configuração — Antigravity Mobile Remote Chat

Guia de configuração do OmniAntigravityRemoteChat para o repositório `melinda20-ui/antigravit-mobile-`.

---

## ✅ O que foi configurado

Este repositório agora contém o **OmniAntigravityRemoteChat** — uma ferramenta que espelha o seu chat do Antigravity (IA) no celular em tempo real.

Baseado em: https://github.com/diegosouzapw/OmniAntigravityRemoteChat

---

## 🚀 Como usar

### 1. Pré-requisito — Abrir o Antigravity em modo debug

Antes de tudo, abra o Antigravity com a porta de depuração ativada:

```powershell
antigravity . --remote-debugging-port=7800
```

💡 **Dica:** Crie um atalho no PowerShell colocando isso no perfil:
```powershell
function agd { antigravity . --remote-debugging-port=7800 }
```

### 2. Configurar o `.env`

Copie o arquivo de exemplo e edite com suas configurações:

```powershell
copy .env.example .env
```

Edite o `.env` e configure pelo menos:
```env
APP_PASSWORD=sua-senha-aqui
PORT=4747
```

### 3. Instalar dependências (já feito)

```powershell
npm install
```

### 4. Iniciar o servidor

```powershell
# Modo simples (Wi-Fi local)
npm start

# Modo com QR Code para Wi-Fi
npm run start:local

# Modo com ngrok (acesso pela internet)
npm run start:web
```

### 5. Acessar no celular

Após iniciar, o terminal mostrará um endereço como:
```
http://192.168.x.x:4747
```

Abra esse endereço no navegador do celular. 🎉

---

## 📱 Funcionalidades

- ✅ Espelhamento do chat em tempo real
- ✅ Enviar mensagens pelo celular
- ✅ Trocar modelos de IA
- ✅ Gerenciar múltiplas janelas do Antigravity
- ✅ 5 temas (dark, light, slate, pastel, rainbow)
- ✅ Captura de screenshots com histórico
- ✅ Terminal remoto e navegação de arquivos

---

## 🔑 Variáveis do `.env`

| Variável | Descrição | Padrão |
|---|---|---|
| `APP_PASSWORD` | Senha do painel mobile | obrigatório |
| `PORT` | Porta do servidor web | `4747` |
| `NGROK_AUTHTOKEN` | Token do ngrok (acesso externo) | opcional |
| `CDP_PORTS` | Portas CDP do Antigravity | `7800` |

---

## 🏗️ Estrutura do Projeto

```
src/server.js       — Servidor principal (Express + WebSocket + CDP)
public/             — Interface web mobile (HTML/CSS/JS)
launcher.js         — Entry point com QR code + ngrok
scripts/            — Scripts auxiliares (SSL, contexto Windows)
.env.example        — Exemplo de configuração
```

---

## ❓ Dúvidas

Consulte o README original (em inglês):
https://github.com/diegosouzapw/OmniAntigravityRemoteChat#readme

Ou o README em português:
https://github.com/diegosouzapw/OmniAntigravityRemoteChat/blob/master/README.pt-BR.md
