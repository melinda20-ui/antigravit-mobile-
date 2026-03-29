const statusDot = document.getElementById('minimalStatusDot');
const statusText = document.getElementById('minimalStatusText');
const content = document.getElementById('minimalContent');
const chat = document.getElementById('minimalChat');
const input = document.getElementById('minimalMessageInput');
const sendBtn = document.getElementById('minimalSendBtn');

let ws = null;

async function fetchWithAuth(url, options = {}) {
  const nextOptions = { ...options };
  nextOptions.headers = { ...(options.headers || {}), 'ngrok-skip-browser-warning': 'true' };
  const response = await fetch(url, nextOptions);
  if (response.status === 401) {
    window.location.href = '/login.html';
    return new Promise(() => {});
  }
  return response;
}

function setStatus(connected) {
  statusDot.classList.toggle('connected', connected);
  statusDot.classList.toggle('disconnected', !connected);
  statusText.textContent = connected ? 'Live' : 'Reconnecting';
}

async function loadSnapshot() {
  try {
    const response = await fetchWithAuth('/snapshot');
    if (!response.ok) return;
    const payload = await response.json();
    content.innerHTML = `<div class="snapshot-shell">${payload.html}</div>`;
    chat.scrollTop = chat.scrollHeight;
  } catch (_) {}
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  input.style.height = 'auto';
  await fetchWithAuth('/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  setTimeout(loadSnapshot, 500);
}

function connect() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);
  ws.onopen = () => {
    setStatus(true);
    loadSnapshot();
  };
  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'snapshot_update') {
      loadSnapshot();
    }
    if (payload.type === 'error' && payload.message === 'Unauthorized') {
      window.location.href = '/login.html';
    }
  };
  ws.onclose = () => {
    setStatus(false);
    setTimeout(connect, 2000);
  };
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
});

connect();
