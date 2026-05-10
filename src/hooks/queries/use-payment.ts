import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPaymentHistory, 
  PaymentHistoryParams, 
  requestRefund, 
  RefundRequestPayload,
  getPendingRefunds,
  RefundItem,
  processRefund,
  ProcessRefundPayload,
  getRefundDetail
} from '@/lib/services/payment.service'

export function usePaymentHistory(params?: PaymentHistoryParams) {
  return useQuery({
    queryKey: ['payment-history', params],
    queryFn: () => getPaymentHistory(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function usePendingRefunds(params?: any) {
  return useQuery({
    queryKey: ['pending-refunds', params],
    queryFn: () => getPendingRefunds(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useRefundDetail(refundId: number | string | null) {
  return useQuery({
    queryKey: ['refund-detail', refundId],
    queryFn: () => getRefundDetail(refundId!),
    enabled: !!refundId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useRequestRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RefundRequestPayload) => requestRefund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
    },
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ refundId, payload }: { refundId: number, payload: ProcessRefundPayload }) => 
      processRefund(refundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-refunds'] })
    },
  })
}
