import { api } from "@/lib/axios"
import { User } from "@/store/useAuthStore"

export interface UpdateProfilePayload {
  username: string
  firstName: string
  lastName: string
  dob: string | null
  sex: boolean | null
  avatar: string | null
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.put("/users/me", payload)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/users/me")
  return data
}
