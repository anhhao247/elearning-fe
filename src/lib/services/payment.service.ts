import { api } from '@/lib/axios'

export interface OrderItem {
  courseId: number
  price: number
}

export interface OrderPayload {
  userId: number
  couponId?: number
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

export interface ValidateCouponPayload {
  code: string
  courseId: number
}

export interface ValidateCouponResponse {
  code: string
  couponId: number
  discountAmount: number
  discountType: string
  discountValue: number
  finalPrice: number
  message: string
  originalPrice: number
}

export async function validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
  const { data } = await api.post('/v1/coupons/validate', payload)
  return data
}

export interface PaymentCourse {
  courseId: number
  price: number
  thumbnail: string
  title: string
}

export interface PaymentHistoryItem {
  amount: number
  bankCode: string
  courses: PaymentCourse[]
  orderId: number
  orderStatus: string
  orderTotalPrice: number
  paymentDate: string
  paymentId: number
  status: string
  transactionNo: string
}

export interface PageResponse<T> {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: {
    offset: number
    pageNumber: number
    pageSize: number
    paged: boolean
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    unpaged: boolean
  }
  size: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  totalElements: number
  totalPages: number
}

export interface PaymentHistoryParams {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export async function getPaymentHistory(params?: PaymentHistoryParams): Promise<PageResponse<PaymentHistoryItem>> {
  const { data } = await api.get('/v1/payments/history', { params })
  return data
}

