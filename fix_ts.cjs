const fs = require('fs');

let content = fs.readFileSync('src/server.js', 'utf8');

// Fix implicitly any subscriptions
content = content.replace(/let suggestionQueueUnsubscribe = null;/g, '/** @type {(() => void) | null} */\nlet suggestionQueueUnsubscribe = null;');
content = content.replace(/let sessionStatsUnsubscribe = null;/g, '/** @type {(() => void) | null} */\nlet sessionStatsUnsubscribe = null;');
content = content.replace(/let quotaServiceUnsubscribe = null;/g, '/** @type {(() => void) | null} */\nlet quotaServiceUnsubscribe = null;');
content = content.replace(/let timelineUnsubscribe = null;/g, '/** @type {(() => void) | null} */\nlet timelineUnsubscribe = null;');

// Fix serverLogs
content = content.replace(/const serverLogs = \[\];/g, '/** @type {Array<{level: string, message: string, timestamp: string}>} */\nconst serverLogs = [];');

// Fix format/quality typing
content = content.replace(/const params = \{ format \};/g, '/** @type {any} */\n        const params = { format };');

// Fix global catch (error) blocks
content = content.replace(/} catch \(error\) {/g, '} catch (e) { const error = /** @type {Error} */ (e);');
content = content.replace(/} catch \(err\) {/g, '} catch (e) { const err = /** @type {Error} */ (e);');

// Fix specific 'catch (e)' lines where 'e.message' or similar is accessed
content = content.replace(/catch \(e\) \{\s*console\.warn\(`⚠️ Cloudflare tunnel failed: \$\{e\.message\}`\);\s*\}/g, 'catch (e) { console.warn(`⚠️ Cloudflare tunnel failed: ${(/** @type {Error} */ (e)).message}`); }');

// Specific type fixes
content = content.replace(/async function approveQueuedSuggestion\(id\)/g, '/** @param {string} id */\nasync function approveQueuedSuggestion(id)');
content = content.replace(/function rejectQueuedSuggestion\(id\)/g, '/** @param {string} id */\nfunction rejectQueuedSuggestion(id)');
content = content.replace(/async function selectChat\(cdp\)/g, '/** @param {any} cdp */\nasync function selectChat(cdp)');
content = content.replace(/function startHeartbeat\(status\)/g, '/** @param {string} status */\nfunction startHeartbeat(status)');
content = content.replace(/function broadcastCDPStatus\(status\)/g, '/** @param {string} status */\nfunction broadcastCDPStatus(status)');

// Fix event handler params
content = content.replace(/sessionStats\.on\('stats_updated', \(summary\) => \{/g, "sessionStats.on('stats_updated', (/** @type {any} */ summary) => {");
content = content.replace(/quotaService\.on\('quota_updated', \(summary\) => \{/g, "quotaService.on('quota_updated', (/** @type {any} */ summary) => {");
content = content.replace(/quotaService\.on\('quota_warning', \(model\) => \{/g, "quotaService.on('quota_warning', (/** @type {any} */ model) => {");
content = content.replace(/screenshotTimeline\.on\('timeline_updated', \(summary\) => \{/g, "screenshotTimeline.on('timeline_updated', (/** @type {any} */ summary) => {");
content = content.replace(/screenshotTimeline\.on\('screenshot_captured', \(payload\) => \{/g, "screenshotTimeline.on('screenshot_captured', (/** @type {any} */ payload) => {");
content = content.replace(/screenshotTimeline\.on\('screenshot_cleaned', \(payload\) => \{/g, "screenshotTimeline.on('screenshot_cleaned', (/** @type {any} */ payload) => {");
content = content.replace(/suggestionQueueUnsubscribe = suggestQueue\.on\('\*', \(event, summary\) => \{/g, "suggestionQueueUnsubscribe = suggestQueue.on('*', (/** @type {any} */ event, /** @type {any} */ summary) => {");
content = content.replace(/sessionStatsUnsubscribe = sessionStats\.on\('\*', \(event, summary\) => \{/g, "sessionStatsUnsubscribe = sessionStats.on('*', (/** @type {any} */ event, /** @type {any} */ summary) => {");
content = content.replace(/quotaServiceUnsubscribe = quotaService\.on\('\*', \(event, summary\) => \{/g, "quotaServiceUnsubscribe = quotaService.on('*', (/** @type {any} */ event, /** @type {any} */ summary) => {");
content = content.replace(/timelineUnsubscribe = screenshotTimeline\.on\('\*', \(event, summary, payload\) => \{/g, "timelineUnsubscribe = screenshotTimeline.on('*', (/** @type {any} */ event, /** @type {any} */ summary, /** @type {any} */ payload) => {");

// Fix params typing line 400
content = content.replace(/const screenStreamState = \{([\s\S]*?)listener: null\n\};/g, 'const screenStreamState = {$1/** @type {((params: any) => Promise<void>) | null} */\n    listener: null\n};');

// Fix indexing {}
content = content.replace(/req\.cookies\['omni_ag_auth'\]/g, "((/** @type {Record<string, string>} */ (req.cookies))['omni_ag_auth'])");
content = content.replace(/app\.use\('\/api', \(req, res, next\) => \{([\s\S]*?)if \(!req\.cookies/g, "app.use('/api', (/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ next) => {$1if (!req.cookies");

// Fix number port
content = content.replace(/app\.listen\(SERVER_PORT, /g, "app.listen(Number(SERVER_PORT), ");

// Fix snapshotHash typing
content = content.replace(/await requestSnapshot\(\{ reason: 'suggest_mode', force: true, snapshotHash: lastSnapshotHash \}\)/g, "await requestSnapshot(/** @type {any} */ ({ reason: 'suggest_mode', force: true, snapshotHash: lastSnapshotHash }))");

// Fix result.data.name
content = content.replace(/result\.data\.name/g, "result.data.fileName");

// Write back
fs.writeFileSync('src/server.js', content, 'utf8');
console.log('Fixed src/server.js TS errors');
