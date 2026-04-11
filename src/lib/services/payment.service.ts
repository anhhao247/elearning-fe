import { api } from '@/lib/axios'

export interface OrderItem {
  courseId: number
  price: number
}

export interface OrderPayload {
  userId: number
  items: OrderItem[]
}

export interface OrderResponse {
  orderId: number
  message: string
}

export interface PaymentPayload {
  orderId: number
}

export interface PaymentResponse {
  url: string
}

export interface VerifyPaymentResponse {
  message: string
  status: 'SUCCESS' | 'FAILED'
}

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  const { data } = await api.post('/v1/orders/create', payload)
  return data
}

export async function createPayment(payload: { orderId: number }): Promise<PaymentResponse> {
  const { data } = await api.post('/v1/payments/create', payload)
  return data
}

export async function verifyVNPayReturn(queryString: string): Promise<VerifyPaymentResponse> {
  // ensure the queryString starts with ?
  const sanitizedQuery = queryString.startsWith('?') ? queryString : `?${queryString}`
  const { data } = await api.get(`/v1/payments/vnpay-return${sanitizedQuery}`)
  return data
}
