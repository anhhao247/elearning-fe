import { api } from "@/lib/axios"
import {
  CurrentSubscription,
  SubscriptionPlan,
  SubscriptionPurchaseResponse,
} from "@/types/subscription"

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await api.get("/v1/subscription-plans")
  return data
}

export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  const { data } = await api.get("/v1/student/subscriptions/current")
  return data
}

export async function purchaseSubscriptionPlan(
  planId: number
): Promise<SubscriptionPurchaseResponse> {
  const { data } = await api.post("/v1/student/subscriptions/purchase", { planId })
  return data
}
