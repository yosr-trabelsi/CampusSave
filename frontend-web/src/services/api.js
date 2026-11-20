import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

// Ajoute automatiquement le token Firebase à chaque requête
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getUsers = () => api.get('/admin/users').then((r) => r.data)
export const setUserActive = (uid, isActive) =>
  api.put(`/admin/users/${uid}/status`, { isActive })
export const approveMerchant = (uid) => api.put(`/admin/merchants/${uid}/approve`)
export const rejectMerchant = (uid) => api.put(`/admin/merchants/${uid}/reject`)
export const registerUser = (data) => api.post('/auth/register', data).then((r) => r.data)
export const getOffers = () => api.get('/offers').then((r) => r.data)
export const createOffer = (data) => api.post('/offers', data).then((r) => r.data)
export const updateOffer = (id, data) => api.put(`/offers/${id}`, data)
export const deleteOffer = (id) => api.delete(`/offers/${id}`)
export const createOrder = (data) => api.post('/orders', data).then((r) => r.data)
export const getMyOrders = () => api.get('/orders/my-orders').then((r) => r.data)
export const getMerchantOrders = () => api.get('/orders/merchant-orders').then((r) => r.data)
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status })
export default api