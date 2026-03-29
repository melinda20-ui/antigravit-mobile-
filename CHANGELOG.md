# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-03-29

### Added

- 🎨 **Workspace refresh** — Completed the modular CSS split, expanded the theme system to five themes, and separated chat/workspace/assist styling for cleaner UI evolution.
- 🧠 **Supervisor Suggest Mode** — Added a bounded suggestion queue with REST endpoints, WebSocket state, Telegram approval/rejection support, and pending review counts in the mobile UI.
- 📊 **Session analytics** — Added in-memory session stats, `/api/stats`, a mobile Stats panel, and Telegram stats summaries for messages, approvals, errors, quota warnings, and screen activity.
- 📈 **Model quota service** — Added real local language-server quota discovery, `/api/quota`, automatic alerting, Telegram `/quota`, and a mobile limits summary.
- 💬 **Assist workspace tab** — Added supervisor-backed assist chat history, `/api/assist/*` endpoints, contextual action buttons, and markdown rendering in the mobile workspace.
- 🖼️ **Screenshot timeline** — Added persistent captures in `data/screenshots/`, `/api/timeline*` routes, background change-aware capture scheduling, cleanup, and a dedicated mobile Timeline panel.
- 🧪 **Vitest suite** — Added unit tests for config, hash, network, supervisor, Telegram, session stats, quota, and screenshot timeline, with coverage tooling and `test:unit` scripts.
- 🪟 **Windows & WSL2 Integration** — Added PowerShell context menu scripts (`Start-OmniChat.ps1`, `Start-OmniChat-Ngrok.ps1`) for seamless 1-click execution in WSL2 environments directly from the native Windows File Explorer.

### Changed

- 🤖 **AI Supervisor transport** — Replaced the Ollama-specific supervisor transport with an OmniRoute OpenAI-compatible integration (`/v1/chat/completions`) plus `OMNIROUTE_SUPERVISOR_*` environment variables.
- ⚙️ **Customizable CDP Ports** — Added `CDP_PORTS` environment variable support in `.env` for configurable remote debugging port ranges.
- 📦 **Release versioning** — Synchronized package/runtime metadata to `1.2.0` and refreshed release documentation for the current feature set.

## [1.1.0] - 2026-03-29

### Added

- 📲 **Phase 3: PWA & UI Modernization** — Added `manifest.json`, `sw.js`, a modular CSS architecture, theme persistence (dark, light, slate) and a new `minimal.html` Lite Mode for unstable connections.
- 🧰 **Phase 4: Remote Workspace** — Added mobile file browsing, syntax-highlighted file preview, remote terminal streaming, Git actions and live desktop screencast controls.
- 🛠️ **Phase 5: Admin & Tunnel Control** — Added `/admin`, server/runtime metrics, Cloudflare Quick Tunnel orchestration, persistent quick commands in `/data/quick-commands.json` and `.gitleaks.toml`.
- 🤖 **Phase 6: AI Optimization** — Added incremental morph diff rendering, `/api/upload-image`, a local AI `AISupervisor` and safe auto-approval integration for pending actions.

## [1.1.1] - 2026-03-29

### Added

- 🤖 **Phase 2: Remote Autonomy (Human-in-the-loop)** — The mobile interface now detects when the LLM halts to await user permission (e.g. CLI operations). It displays a priority alert modal with 1-tap "Accept" or "Reject" actions directly from the smartphone.
- 📱 **Telegram Bot Integration** — Embedded native push notification alerts via Telegram. The system automatically messages the linked smartphone when critical events arise, such as "Agent Blocks/Quotas", unhandled "Pending Approvals", or "Task Completed Successfully".
- 🔌 **Action Interaction API** — Added `/api/interact-action` endpoint on the server side to deterministically trigger DOM elements corresponding to UI permissions on the Antigravity desktop client.
- 🎉 **Task Completion Hook** — Enhanced DOM polling loops to scan conversational structures for explicit task completion indicators.

## [1.0.2] - 2026-03-29

### Added

- 📊 **Phase 1: Quota Monitoring UI** — Added visual integration within the settings bar for tracking API usage targets.
- 🔔 **Slide-in Notification System** — Developed a clean, non-intrusive alert layer on the frontend.
- 🛑 **Autonomous Error Interceptor** — The Node.js WebSocket backend now reads the live DOM stream to automatically extract errors ("Agent terminated", "Model quota reached") and pushes slide-in notifications to the user remotely.

## [1.0.1] - 2026-03-01

### Added

- 🌐 29-language README translations (pt-BR, es, fr, it, ru, zh-CN, de, ja, in, th, uk-UA, ar, vi, bg, da, fi, he, hu, id, ko, ms, nl, no, pt, ro, pl, sk, sv, phi)
- 🏳️ Language bar with 30 flag emojis in README.md header
- 📝 Reusable PRD prompt for multi-language documentation

## [0.5.3] - 2026-02-28

### Changed

- ♻️ Architecture refactoring — extracted `config.js`, `state.js`, `utils/`, `cdp/connection.js` from monolithic `server.js`
- 📝 JSDoc typing added to all modules: 13 CDP functions, 6 state vars, `launcher.js`, `app.js` header
- 🧹 Replaced cryptic import aliases (`_fu`, `_dn`, `_jn`) with full names (`fileURLToPath`, `dirname`, `join`)
- 🔧 Version now managed from single source of truth (`config.js` → `VERSION`)
- 📚 Updated README Project Structure, Configuration table (+COOKIE_SECRET, +AUTH_SALT)
- 📚 Updated CODE_DOCUMENTATION.md with modular architecture (config, state, utils, cdp sections)
- 🚀 `launcher.js` refactored: removed duplicate `getLocalIP()`, imports from `utils/network.js`

## [0.5.1] - 2026-02-28

### Added

- 🖼️ Base64 image conversion — SVGs/icons now converted to data URIs in snapshots, fixing broken images via ngrok
- 🎯 Deterministic click targeting — occurrence index tracking + leaf-node filtering for precise button clicks
- 🔍 Smart container detection — priority fallback chain (`#cascade` → `#conversation` → `#chat`) for compatibility
- 💎 Glassmorphism quick-action pills — `backdrop-filter: blur(12px)`, violet glow on hover, micro-animations
- 💡 "Explain" quick-action pill — one-tap code explanation alongside Continue/Fix Bugs/Create Docs
- 🔐 Cookie secret externalization — `COOKIE_SECRET` and `AUTH_SALT` configurable via `.env`

## [0.5.0] - 2026-02-22

### Added

- 🚀 Unified release workflow: auto GitHub Release + NPM publish on version bump
- 📖 Launch Modes section in README (Git Clone vs NPM, ngrok, SSL guides)
- 🎨 Premium open-right startup banner with ANSI gradient
- 📝 CHANGELOG updated with full v0.4.x history

### Changed

- ⬆️ All deps at latest: dotenv 17.3.1, express 4.22.1
- 🔧 Node.js minimum: 22
- 🔧 CI matrix: Node 22 + 24

### Fixed

- 🐛 npx loading wrong `.env` from cwd instead of package directory
- 🐛 Banner alignment issues with ANSI escape codes

## [0.4.10] - 2026-02-22

### Changed

- 🎨 Redesigned startup banner — open-right style, no ANSI alignment issues
- 📖 Added Launch Modes documentation (Git Clone vs NPM, ngrok, SSL guides)
- 🔖 Version bumped across package.json, server.js, README badges

## [0.4.9] - 2026-02-22

### Added

- 🎨 Premium Google CLI-style startup banner with gradient OMNI ASCII art
- 📖 NPM badges with download counter and npmjs.com links in README

## [0.4.8] - 2026-02-22

### Fixed

- 🐛 Fix `npx` loading wrong `.env` file from `cwd` instead of package directory
- 🐛 Fix duplicate `join`/`dirname` imports after dotenv refactor

### Added

- 🚀 `publish.yml` — auto-publish to NPM on GitHub Release
- 🔑 NPM_TOKEN configured as GitHub repo secret

## [0.4.7] - 2026-02-22

### Changed

- ⬆️ `dotenv` 16.x → 17.3.1, `express` 4.18 → 4.22.1
- 🔧 Node.js minimum: 16 → 22
- 🔧 CI matrix: Node 18/20/22 → 22/24
- 📁 `test.js` moved to `test/test.js`
- 🔧 `launcher.js` default port fixed: 3000 → 4747

## [0.4.6] - 2026-02-22

### Changed

- 📖 Complete README rewrite for v0.4.6 with NPM install instructions
- 📖 CODE_DOCUMENTATION.md updated with multi-window and UX sections
- 📖 DESIGN_PHILOSOPHY.md updated with v0.4.x trade-offs
- 📦 `package.json` NPM metadata: keywords, homepage, repository, contributors
- 🙏 Acknowledgments to original author Krishna Kanth B

## [0.4.5] - 2026-02-22

### Added

- 🔓 Force-expand all `<details>` and collapsible containers via CSS + JS
- ⏱️ Extended scroll lock to 15 seconds for user interaction protection
- 🛡️ Transient 503 protection during window switches

## [0.4.0] - 2026-02-22

### Added

- 🪟 Multi-window management with smart CDP target filtering
- 🔍 Excludes internal pages (Settings, Launchpad, jetski)
- 🔄 Retry logic: 2s wait + 5x snapshot retry on window switch
- 🚀 Launch new Antigravity windows from phone (`POST /api/launch-window`)
- 📜 Chat history fix: `data.chats` key alignment
- 🖥️ Clean window display names (removes port numbers and raw titles)

## [0.3.6] - 2026-02-22

### Added

- 🔄 GitHub Actions CI workflow (Node 18/20/22 matrix)
- 📖 Updated all documentation to reflect current project state

### Changed

- 🔢 Version scheme aligned to 0.3.x (was incorrectly set to 2.0.0)

## [0.3.5] - 2026-02-22

### Added

- 🤖 `AGENTS.md` — AI coding assistant instructions
- 📋 `CHANGELOG.md` — version history (Keep a Changelog)
- 🤝 `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- 📝 `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`
- 📝 `.github/PULL_REQUEST_TEMPLATE.md`
- Moved `SECURITY.md` and `CONTRIBUTING.md` to project root

## [0.3.4] - 2026-02-22

### Changed

- 📁 Project reorganized into `src/`, `scripts/`, `docs/` structure
- `server.js` → `src/server.js` with `PROJECT_ROOT` constant
- Shell scripts → `scripts/start.sh`, `scripts/start_web.sh`
- Documentation → `docs/`
- Updated all import paths and npm scripts

## [0.3.3] - 2026-02-22

### Removed

- 🗑️ `launcher.py` removed — project is now 100% Node.js (zero Python)
- Cleaned up `.venv/` virtual environment

## [0.3.2] - 2026-02-22

### Added

- 🧪 Validation test suite (`test.js`) with 25 checks
- 📖 Step-by-step README with setup guide, port reference, troubleshooting

### Changed

- 🔧 CDP debug ports: `9000` → `7800` (avoids PHP-FPM/SonarQube conflicts)
- 🔧 Web server default port: `3000` → `4747` (avoids Express/React conflicts)
- Updated `~/.bashrc` alias `agd` to use port 7800

## [0.3.1] - 2026-02-22

### Added

- ✨ Rebranded to **OmniAntigravity Remote Chat**
- 🎨 Premium mobile UI: gradient brand palette, pulse animations, glassmorphism, spring-animated modals
- 🪟 Multi-window CDP support: `discoverAllCDP()`, `/cdp-targets`, `/select-target` endpoints
- 🚀 Node.js launcher (`launcher.js`) with QR code and ngrok support
- 🔁 Auto-reconnect: exponential backoff, WebSocket heartbeat, CDP status broadcasting, mobile toast notifications

### Fixed

- 🐛 Critical CDP port mismatch: was scanning `5000-5003` instead of `9000-9003`
- 🐛 Auth cookie renamed from `ag_auth_token` to `omni_ag_auth`

## [0.3.0] - 2026-02-22

### Changed

- 🚀 Forked as **OmniAntigravityRemoteChat** from `antigravity_phone_chat`
- Git remote switched to `diegosouzapw/OmniAntigravityRemoteChat`
- Updated `.gitignore` with `.venv/`
- Shell scripts updated to prioritize local Python venv (PEP 668 fix)

---

## Pre-Fork History (antigravity_phone_chat)

### [0.2.17] - 2026-02-21

- Documentation sync for v0.2.17

### [0.2.14 → 0.2.16]

- Updated available AI models
- Glassmorphism UI for quick actions and settings bar
- Dark mode styling and model detection fixes

### [0.2.10 → 0.2.13]

- Enhanced DOM cleanup in snapshot capture
- Chat history features and security improvements

### [0.2.5 → 0.2.9]

- Chat history management with conversation controls
- Full-screen history layer, model selector improvements
- Multiple chat container ID support

### [0.2.0 → 0.2.4]

- Global remote access with web tunneling
- Unified Python launcher, context menu icons
- Auto `.env` creation from template

### [0.1.0 → 0.1.9]

- SSL certificate generation and HTTPS support
- Scroll sync, mobile copy buttons, user scroll lock
- Client-side authentication, web access with login page

### [0.0.1 → 0.0.12]

- Initial release with CDP-based chat mirroring
- Premium dark theme UI
- Context menu installation scripts for Windows/Linux
