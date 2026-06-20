/**
 * YBF — Centralized RESTful API Service Layer
 * All server communication goes through this module.
 * Base URL is configurable via environment variable.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ─── Core HTTP Client ────────────────────────────────────────────────────────

async function request(method, path, body = null, signal = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(signal ? { signal } : {}),
  }
  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)
  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

const get    = (path, signal)       => request('GET',    path, null, signal)
const post   = (path, body)         => request('POST',   path, body)
const put    = (path, body)         => request('PUT',    path, body)
const patch  = (path, body)         => request('PATCH',  path, body)
const del    = (path)               => request('DELETE', path)

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/register */
  register: (payload) => post('/api/auth/register', payload),

  /** POST /api/auth/login */
  login: (email, password) => post('/api/auth/login', { email, password }),

  /** POST /api/auth/admin/login */
  adminLogin: (email, password) => post('/api/auth/admin/login', { email, password }),

  /** POST /api/auth/company/login */
  companyLogin: (email, password) => post('/api/auth/company/login', { email, password }),
}

// ─── Flights ─────────────────────────────────────────────────────────────────

export const flightsApi = {
  /** GET /api/flights */
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/flights${qs ? `?${qs}` : ''}`)
  },

  /** GET /api/flights/search?from=&to=&date= */
  search: ({ from, to, date } = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries({ from, to, date }).filter(([, v]) => v))
    ).toString()
    return get(`/api/flights/search${qs ? `?${qs}` : ''}`)
  },

  /** POST /api/flights */
  create: (payload) => post('/api/flights', payload),

  /** PUT /api/flights/:id */
  update: (id, payload) => put(`/api/flights/${id}`, payload),

  /** DELETE /api/flights/:id */
  remove: (id) => del(`/api/flights/${id}`),
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingsApi = {
  /** GET /api/bookings?userId= */
  getByUser: (userId) => get(`/api/bookings?userId=${userId}`),

  /** POST /api/bookings */
  create: (payload) => post('/api/bookings', payload),

  /** PATCH /api/bookings/:id/status */
  updateStatus: (id, payload) => patch(`/api/bookings/${id}/status`, payload),

  /** PATCH /api/bookings/:id/cancel */
  cancel: (id) => patch(`/api/bookings/${id}/cancel`, {}),

  /** GET /api/bookings/:id/passengers */
  getPassengers: (bookingId) => get(`/api/bookings/${bookingId}/passengers`),
}

// ─── Passengers ──────────────────────────────────────────────────────────────

export const passengersApi = {
  /** POST /api/passengers */
  upsert: (passengers, userId) => post('/api/passengers', { passengers, userId }),
}

// ─── Seats ───────────────────────────────────────────────────────────────────

export const seatsApi = {
  /** GET /api/seats?flightId= */
  getByFlight: (flightId) => get(`/api/seats?flightId=${flightId}`),

  /** POST /api/seats/hold */
  hold: (payload) => post('/api/seats/hold', payload),

  /** DELETE /api/seats/hold */
  releaseHold: (payload) => request('DELETE', '/api/seats/hold', payload),
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  /** GET /api/notifications?userId= */
  getByUser: (userId) => get(`/api/notifications/${userId}`),

  /** PATCH /api/notifications/:id/read */
  markRead: (id) => patch(`/api/notifications/${id}/read`, {}),

  /** PATCH /api/notifications/read-all/:userId */
  markAllRead: (userId) => patch(`/api/notifications/read-all/${userId}`, {}),

  /** DELETE /api/notifications/:id */
  remove: (id) => del(`/api/notifications/${id}`),
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  // Dashboard
  /** GET /api/admin/dashboard-stats */
  getDashboardStats: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/admin/dashboard-stats${qs ? `?${qs}` : ''}`)
  },

  // Users
  /** GET /api/admin/users */
  getUsers: () => get('/api/admin/users'),
  /** POST /api/admin/users */
  createUser: (payload) => post('/api/admin/users', payload),
  /** PUT /api/admin/users/:id */
  updateUser: (id, payload) => put(`/api/admin/users/${id}`, payload),
  /** DELETE /api/admin/users/:id */
  deleteUser: (id) => del(`/api/admin/users/${id}`),

  // Bookings
  /** GET /api/admin/bookings */
  getBookings: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/admin/bookings${qs ? `?${qs}` : ''}`)
  },

  // Companies
  /** GET /api/admin/companies */
  getCompanies: () => get('/api/admin/companies'),
  /** POST /api/admin/companies */
  createCompany: (payload) => post('/api/admin/companies', payload),
  /** PUT /api/admin/companies/:id */
  updateCompany: (id, payload) => put(`/api/admin/companies/${id}`, payload),
  /** DELETE /api/admin/companies/:id */
  deleteCompany: (id) => del(`/api/admin/companies/${id}`),
}

// ─── Company ─────────────────────────────────────────────────────────────────

export const companyApi = {
  /** GET /api/flights?airlineCode= */
  getFlights: (airlineCode, date) =>
    flightsApi.getAll({ airlineCode, date }),

  /** POST /api/flights */
  createFlight: (payload) => flightsApi.create(payload),

  /** PUT /api/flights/:id */
  updateFlight: (id, payload) => flightsApi.update(id, payload),

  /** DELETE /api/flights/:id */
  deleteFlight: (id) => flightsApi.remove(id),
}
