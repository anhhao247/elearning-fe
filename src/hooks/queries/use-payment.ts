import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPaymentHistory, 
  PaymentHistoryParams, 
  requestRefund, 
  RefundRequestPayload,
  RefundItem,
  getAdminRefundRequests,
  getAdminRefundDetail,
  approveRefund,
  ApproveRefundPayload,
  rejectRefund,
  RejectRefundPayload,
  getStudentRefundRequests
} from '@/lib/services/payment.service'

export function usePaymentHistory(params?: PaymentHistoryParams) {
  return useQuery({
    queryKey: ['payment-history', params],
    queryFn: () => getPaymentHistory(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useAdminRefundRequests(params?: any) {
  return useQuery({
    queryKey: ['admin-refund-requests', params],
    queryFn: () => getAdminRefundRequests(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useStudentRefundRequests(params?: any) {
  return useQuery({
    queryKey: ['student-refund-requests', params],
    queryFn: () => getStudentRefundRequests(params),
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useAdminRefundDetail(refundId: number | string | null) {
  return useQuery({
    queryKey: ['admin-refund-detail', refundId],
    queryFn: () => getAdminRefundDetail(refundId!),
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
      queryClient.invalidateQueries({ queryKey: ['student-refund-requests'] })
    },
  })
}

export function useApproveRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ refundId, payload }: { refundId: number, payload: ApproveRefundPayload }) => 
      approveRefund(refundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-refund-detail'] })
    },
  })
}

export function useRejectRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ refundId, payload }: { refundId: number, payload: RejectRefundPayload }) => 
      rejectRefund(refundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-refund-detail'] })
    },
  })
}
