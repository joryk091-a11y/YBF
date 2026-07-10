





const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'



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



export const authApi = {
  
  register: (payload) => post('/api/auth/register', payload),

  
  login: (email, password) => post('/api/auth/login', { email, password }),

  
  adminLogin: (email, password) => post('/api/auth/admin/login', { email, password }),

  
  companyLogin: (email, password) => post('/api/auth/company/login', { email, password }),
}



export const flightsApi = {
  
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/flights${qs ? `?${qs}` : ''}`)
  },

  
  search: ({ from, to, date } = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries({ from, to, date }).filter(([, v]) => v))
    ).toString()
    return get(`/api/flights/search${qs ? `?${qs}` : ''}`)
  },

  
  create: (payload) => post('/api/flights', payload),

  
  update: (id, payload) => put(`/api/flights/${id}`, payload),

  
  remove: (id) => del(`/api/flights/${id}`),
}



export const bookingsApi = {
  
  getByUser: (userId) => get(`/api/bookings?userId=${userId}`),

  
  create: (payload) => post('/api/bookings', payload),

  
  updateStatus: (id, payload) => patch(`/api/bookings/${id}/status`, payload),

  
  cancel: (id) => patch(`/api/bookings/${id}/cancel`, {}),

  
  getPassengers: (bookingId) => get(`/api/bookings/${bookingId}/passengers`),
}



export const passengersApi = {
  
  upsert: (passengers, userId) => post('/api/passengers', { passengers, userId }),
}



export const seatsApi = {
  
  getByFlight: (flightId) => get(`/api/seats?flightId=${flightId}`),

  
  hold: (payload) => post('/api/seats/hold', payload),

  
  releaseHold: (payload) => request('DELETE', '/api/seats/hold', payload),
}



export const notificationsApi = {
  
  getByUser: (userId) => get(`/api/notifications/${userId}`),

  
  markRead: (id) => patch(`/api/notifications/${id}/read`, {}),

  
  markAllRead: (userId) => patch(`/api/notifications/read-all/${userId}`, {}),

  
  remove: (id) => del(`/api/notifications/${id}`),
}



export const adminApi = {
  
  
  getDashboardStats: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/admin/dashboard-stats${qs ? `?${qs}` : ''}`)
  },

  
  
  getUsers: () => get('/api/admin/users'),
  
  createUser: (payload) => post('/api/admin/users', payload),
  
  updateUser: (id, payload) => put(`/api/admin/users/${id}`, payload),
  
  deleteUser: (id) => del(`/api/admin/users/${id}`),

  
  
  getBookings: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return get(`/api/admin/bookings${qs ? `?${qs}` : ''}`)
  },

  
  
  getCompanies: () => get('/api/admin/companies'),
  
  createCompany: (payload) => post('/api/admin/companies', payload),
  
  updateCompany: (id, payload) => put(`/api/admin/companies/${id}`, payload),
  
  deleteCompany: (id) => del(`/api/admin/companies/${id}`),
}



export const companyApi = {
  
  getFlights: (airlineCode, date) =>
    flightsApi.getAll({ airlineCode, date }),

  
  createFlight: (payload) => flightsApi.create(payload),

  
  updateFlight: (id, payload) => flightsApi.update(id, payload),

  
  deleteFlight: (id) => flightsApi.remove(id),
}
