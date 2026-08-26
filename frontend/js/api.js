// js/api.js
// Cliente HTTP minimo. La sesion viaja en una cookie httpOnly que el navegador
// maneja solo (credentials: 'include'); NUNCA leemos ni guardamos el token en
// localStorage/sessionStorage. Para peticiones que modifican datos, reenviamos
// el token CSRF (leido de la cookie no-httpOnly cwh_csrf) en un header.
// Usa dinamicamente la URL actual para funcionar con ngrok y local
const API_BASE = window.API_BASE || (window.location.origin);

function readCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

async function apiFetch(path, { method = 'GET', body, params } = {}) {
  let url = API_BASE + path;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    if (qs) url += '?' + qs;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = readCookie('cwh_csrf');
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include', // envia/recibe la cookie de sesion
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }

  if (!res.ok) {
    const message = json?.message || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = json?.details;
    throw error;
  }
  return json?.data;
}

const api = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: data }),
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: data }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),

  availableSpaces: () => apiFetch('/spaces/available'),
  allSpaces: () => apiFetch('/spaces'),
  createSpace: (data) => apiFetch('/spaces', { method: 'POST', body: data }),
  updateSpace: (id, data) => apiFetch(`/spaces/${id}`, { method: 'PATCH', body: data }),
  deactivateSpace: (id) => apiFetch(`/spaces/${id}`, { method: 'DELETE' }),

  plans: () => apiFetch('/plans'),
  createPlan: (data) => apiFetch('/plans', { method: 'POST', body: data }),
  updatePlan: (id, data) => apiFetch(`/plans/${id}`, { method: 'PATCH', body: data }),

  members: () => apiFetch('/members'),
  memberDetail: (id) => apiFetch(`/members/${id}`),
  assignPlan: (id, planId) => apiFetch(`/members/${id}/plan`, { method: 'PATCH', body: { planId } }),
  selectPlan: (planId) => apiFetch('/members/me/plan', { method: 'POST', body: { planId } }),

  myReservations: () => apiFetch('/reservations/mine'),
  createReservation: (data) => apiFetch('/reservations', { method: 'POST', body: data }),
  cancelReservation: (id) => apiFetch(`/reservations/${id}/cancel`, { method: 'POST' }),

  reportReservations: (filters) => apiFetch('/reports/reservations', { params: filters }),
  reportConsumo: (memberId, month) => apiFetch('/reports/consumo', { params: { memberId, month } }),
};
