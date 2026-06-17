const DEFAULT_WS_URL = 'ws://127.0.0.1:8000/ws';
const RECONNECT_DELAY_MS = 3000;

let socket = null;
let reconnectTimer = null;
let shouldReconnect = true;
let connectionStatus = 'disconnected';

const messageListeners = new Set();
const statusListeners = new Set();

function notifyStatus(status) {
  connectionStatus = status;
  statusListeners.forEach((listener) => listener(status));
}

function notifyMessage(message) {
  messageListeners.forEach((listener) => listener(message));
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (!shouldReconnect || reconnectTimer) {
    return;
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_DELAY_MS);
}

export function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  shouldReconnect = true;
  clearReconnectTimer();
  notifyStatus('connecting');

  const websocketUrl = import.meta.env.VITE_WS_URL || DEFAULT_WS_URL;
  socket = new WebSocket(websocketUrl);

  socket.onopen = () => {
    notifyStatus('connected');
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      notifyMessage(payload);
    } catch (error) {
      console.error('Failed to parse websocket message', error);
    }
  };

  socket.onerror = () => {
    notifyStatus('disconnected');
  };

  socket.onclose = () => {
    notifyStatus('disconnected');
    socket = null;
    scheduleReconnect();
  };

  return socket;
}

export function disconnect() {
  shouldReconnect = false;
  clearReconnectTimer();

  if (socket) {
    socket.close();
    socket = null;
  }

  notifyStatus('disconnected');
}

export function subscribeToMessages(listener) {
  messageListeners.add(listener);
  connect();

  return () => {
    messageListeners.delete(listener);
  };
}

export function subscribeToStatus(listener) {
  statusListeners.add(listener);
  listener(connectionStatus);
  connect();

  return () => {
    statusListeners.delete(listener);
  };
}

export function getConnectionStatus() {
  return connectionStatus;
}

export default {
  connect,
  disconnect,
  subscribeToMessages,
  subscribeToStatus,
  getConnectionStatus,
};
