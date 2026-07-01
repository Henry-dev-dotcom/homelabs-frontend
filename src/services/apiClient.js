export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 20000);
const REQUEST_RETRY_COUNT = Number(import.meta.env.VITE_API_RETRY_COUNT || 1);

export const LOCAL_DATA_MODE = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function attachPagination(items, meta) {
  const fallback = {
    page: 1,
    limit: items.length,
    total: items.length,
    totalPages: items.length ? 1 : 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  Object.defineProperty(items, 'pagination', {
    value: meta || fallback,
    enumerable: false,
    configurable: true
  });

  return items;
}

export function collectionResponse(response, mapper = (item) => item) {
  if (Array.isArray(response)) return attachPagination(response.map(mapper));
  const data = Array.isArray(response?.data) ? response.data : [];
  return attachPagination(data.map(mapper), response?.meta);
}

export function paginationFrom(items) {
  return items?.pagination || {
    page: 1,
    limit: Array.isArray(items) ? items.length : 0,
    total: Array.isArray(items) ? items.length : 0,
    totalPages: Array.isArray(items) && items.length ? 1 : 0,
    hasPreviousPage: false,
    hasNextPage: false
  };
}

function assertApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured. Set it to the deployed backend API URL, for example https://api.yourdomain.com/api.');
  }
}

function shouldRetryRequest(error) {
  if (error?.name === 'AbortError' || error?.cancelled) return false;
  if (!error?.status) return true;
  return [408, 425, 429, 500, 502, 503, 504].includes(error.status);
}

function retryDelayMs(attempt) {
  return Math.min(300 * 2 ** attempt, 1500);
}

function createAbortSignal(timeoutMs, externalSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs);

  const onExternalAbort = () => controller.abort(externalSignal.reason || new Error('Request cancelled'));
  if (externalSignal) {
    if (externalSignal.aborted) onExternalAbort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
    }
  };
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function requestOnce(path, options = {}) {
  assertApiBaseUrl();
  const token = sessionStorage.getItem('homelabs_token');
  const isFormData = options.body instanceof FormData;
  const timeout = Number(options.timeoutMs || REQUEST_TIMEOUT_MS);
  const { signal, cleanup } = createAbortSignal(timeout, options.signal);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const requestId = response.headers.get('x-request-id') || data?.requestId;
      const error = new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.requestId = requestId;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(options.signal?.aborted ? 'Request cancelled.' : 'Request timed out. Please check your connection and try again.');
      timeoutError.name = 'AbortError';
      timeoutError.cancelled = Boolean(options.signal?.aborted);
      throw timeoutError;
    }
    throw error;
  } finally {
    cleanup();
  }
}

export async function apiRequest(path, options = {}) {
  const retries = Math.max(0, Number(options.retries ?? REQUEST_RETRY_COUNT));
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try { return await requestOnce(path, options); }
    catch (error) {
      lastError = error;
      if (attempt >= retries || !shouldRetryRequest(error)) break;
      await wait(retryDelayMs(attempt));
    }
  }
  throw lastError;
}

export function jsonBody(payload) {
  return { body: JSON.stringify(payload) };
}

export async function apiGet(path, options = {}) {
  return apiRequest(path, { method: 'GET', ...options });
}
