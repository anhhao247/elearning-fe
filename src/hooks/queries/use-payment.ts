import { useQuery } from '@tanstack/react-query'
import { getPaymentHistory, PaymentHistoryParams } from '@/lib/services/payment.service'

export function usePaymentHistory(params?: PaymentHistoryParams) {
  return useQuery({
    queryKey: ['payment-history', params],
    queryFn: () => getPaymentHistory(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}
