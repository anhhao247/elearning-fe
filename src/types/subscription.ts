export interface SubscriptionPlan {
  id: number
  name: string
  price: number
  durationDays: number
  description: string
  isActive: boolean
}

export interface SubscriptionPurchaseResponse {
  url: string
}

export interface CurrentSubscription {
  isPro: boolean
  status: "ACTIVE" | "NONE" | string
  startedAt?: string
  expiredAt?: string
  planId?: number
  planName?: string
  planPrice?: number
  planDurationDays?: number
}
