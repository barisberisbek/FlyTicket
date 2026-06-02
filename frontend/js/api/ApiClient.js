import { getAdminToken, getUserToken } from '../utils/auth.js';

const API_BASE = (typeof window !== 'undefined' && window.__FT_API_URL__)
  || 'http://localhost:5000/api';

export class ApiClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  pickToken(authMode) {
    if (authMode === 'admin') return getAdminToken();
    if (authMode === 'user') return getUserToken();
    return getUserToken() || getAdminToken();
  }

  async request(path, { method = 'GET', body, auth = 'auto', headers = {} } = {}) {
    const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
    const token = this.pickToken(auth);
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${this.baseUrl}${path}`, opts);
    } catch (e) {
      throw { status: 0, message: 'Network error: cannot reach API' };
    }

    let data = null;
    const text = await res.text();
    if (text) { try { data = JSON.parse(text); } catch { data = { raw: text }; } }

    if (!res.ok) {
      throw {
        status: res.status,
        message: data?.error?.message || `Request failed (${res.status})`,
        details: data?.error?.details,
      };
    }
    return data;
  }

  get(p, opts) { return this.request(p, { ...opts, method: 'GET' }); }
  post(p, body, opts) { return this.request(p, { ...opts, method: 'POST', body }); }
  put(p, body, opts) { return this.request(p, { ...opts, method: 'PUT', body }); }
  del(p, opts) { return this.request(p, { ...opts, method: 'DELETE' }); }
}

export const api = new ApiClient();
