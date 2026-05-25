import { api } from '../axios';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: string;
  adminRole?: string | null;
  dob?: string | null;
  sex?: string | boolean | null;
  createdAt: string;
  isActive?: boolean;
  isDeleted?: boolean;
  bannedUntil?: string | null;
  banReason?: string | null;
  isBanned?: boolean;
  bannedAt?: string | null;
}

export interface GetAdminUsersParams {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreateAdminUserPayload {
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  adminRole: string;
}

export const AdminUserService = {
  getUsers: async (params?: GetAdminUsersParams): Promise<AdminUser[]> => {
    const response = await api.get('/v1/admin/users', { params });
    return response.data;
  },

  createUser: async (payload: CreateAdminUserPayload): Promise<AdminUser> => {
    const response = await api.post('/v1/admin/users', payload);
    return response.data;
  },

  updateUser: async (id: number, payload: Partial<CreateAdminUserPayload>): Promise<AdminUser> => {
    const response = await api.put(`/v1/admin/users/${id}`, payload);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/users/${id}`);
  },

  restoreUser: async (id: number): Promise<AdminUser> => {
    const response = await api.put(`/v1/admin/users/${id}/restore`);
    return response.data;
  },

  banUser: async (id: number, payload: { reason: string; bannedUntil?: string | null }): Promise<AdminUser> => {
    const response = await api.patch(`/v1/admin/users/${id}/ban`, payload);
    return response.data;
  },

  unbanUser: async (id: number): Promise<AdminUser> => {
    const response = await api.patch(`/v1/admin/users/${id}/unban`);
    return response.data;
  },
};
