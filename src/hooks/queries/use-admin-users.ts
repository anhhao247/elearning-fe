import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminUserService, GetAdminUsersParams, CreateAdminUserPayload } from '@/lib/services/admin-user.service';
import { toast } from 'sonner';

export function useAdminUsers(params?: GetAdminUsersParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => AdminUserService.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => AdminUserService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Tạo tài khoản admin thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo tài khoản admin thất bại');
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateAdminUserPayload> }) =>
      AdminUserService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Cập nhật tài khoản admin thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật tài khoản admin thất bại');
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AdminUserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Xóa tài khoản admin thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa tài khoản admin thất bại');
    },
  });
}

export function useRestoreAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AdminUserService.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Khôi phục tài khoản admin thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Khôi phục tài khoản admin thất bại');
    },
  });
}

export function useBanAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { reason: string; bannedUntil?: string | null } }) =>
      AdminUserService.banUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Khóa tài khoản thất bại');
    },
  });
}

export function useUnbanAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AdminUserService.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Mở khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Mở khóa tài khoản thất bại');
    },
  });
}
