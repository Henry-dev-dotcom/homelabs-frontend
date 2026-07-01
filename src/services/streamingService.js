import { API_BASE_URL } from './apiClient.js';

function parseSseBlock(block) {
  const event = { event: 'message', data: '', id: undefined };

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

    if (field === 'event') event.event = value;
    if (field === 'id') event.id = value;
    if (field === 'data') event.data = event.data ? `${event.data}\n${value}` : value;
  }

  try {
    event.data = event.data ? JSON.parse(event.data) : null;
  } catch {
    // Keep plain text data as-is when the server sends non-JSON stream chunks.
  }

  return event;
}

export async function streamApiEvents(path, handlers = {}) {
  const token = sessionStorage.getItem('homelabs_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    signal: handlers.signal
  });

  if (!response.ok) throw new Error(`Stream failed with status ${response.status}`);
  if (!response.body) throw new Error('This browser does not support response streaming.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\n\n|\r\n\r\n/);
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      const event = parseSseBlock(block);
      handlers.onEvent?.(event);
      handlers[`on${event.event?.replace(/(^|-)\w/g, (match) => match.replace('-', '').toUpperCase())}`]?.(event.data, event);
      if (event.event === 'message') handlers.onMessage?.(event.data, event);
      if (event.event === 'done') handlers.onDone?.(event.data, event);
    }
  }

  if (buffer.trim()) {
    const event = parseSseBlock(buffer);
    handlers.onEvent?.(event);
  }
}

export function streamReadiness(handlers = {}) {
  return streamApiEvents('/stream/readiness', handlers);
}
