import { api } from "../axios";

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const AuthService = {
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post("/auth/change-password", payload);
  },
};
