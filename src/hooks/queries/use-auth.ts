import { useMutation } from "@tanstack/react-query";
import { AuthService, ChangePasswordPayload } from "@/lib/services/auth.service";
import { toast } from "sonner";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => AuthService.changePassword(payload),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.";
      toast.error(message);
    },
  });
}
