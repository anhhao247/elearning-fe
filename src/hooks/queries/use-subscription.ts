import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getCurrentSubscription,
  getSubscriptionPlans,
  purchaseSubscriptionPlan,
} from "@/lib/services/subscription.service"
import { CurrentSubscription, SubscriptionPlan } from "@/types/subscription"

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: getSubscriptionPlans,
  })
}

export function useCurrentSubscription(enabled: boolean) {
  return useQuery<CurrentSubscription>({
    queryKey: ["current-subscription"],
    queryFn: getCurrentSubscription,
    enabled,
  })
}

export function usePurchaseSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => purchaseSubscriptionPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Đăng ký gói thất bại. Vui lòng thử lại.")
    },
  })
}
