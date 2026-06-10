import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentUserService, GetStudentUsersParams } from '@/lib/services/student-user.service';
import { toast } from 'sonner';

export function useStudentUsers(params?: GetStudentUsersParams) {
  return useQuery({
    queryKey: ['student-users', params],
    queryFn: () => StudentUserService.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBanStudentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { reason: string; bannedUntil?: string | null } }) =>
      StudentUserService.banUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-users'] });
      toast.success('Khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Khóa tài khoản thất bại');
    },
  });
}

export function useUnbanStudentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => StudentUserService.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-users'] });
      toast.success('Mở khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Mở khóa tài khoản thất bại');
    },
  });
}
