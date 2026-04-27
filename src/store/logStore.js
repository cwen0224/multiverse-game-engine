const MAX_LOGS = 300;
const subscribers = new Set();
let logs = [];

const notify = () => {
  for (const callback of subscribers) {
    callback(logs);
  }
};

export function addLog(level, message, detail) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    message,
    detail: detail ?? null,
    timestamp: new Date().toISOString(),
  };
  logs = [...logs.slice(-(MAX_LOGS - 1)), entry];
  notify();
  return entry;
}

export function getLogsSnapshot() {
  return logs;
}

export function subscribeLogs(callback) {
  subscribers.add(callback);
  callback(logs);
  return () => subscribers.delete(callback);
}

export function clearLogs() {
  logs = [];
  notify();
}
