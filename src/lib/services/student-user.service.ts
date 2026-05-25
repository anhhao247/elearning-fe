import { api } from '../axios';

export interface StudentUser {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: 'STUDENT' | 'INSTRUCTOR';
  adminRole: null;
  isDeleted: boolean;
  dob: string | null;
  sex: boolean | null;
  createdAt: string;
  instructorStatus: string | null;
  rejectionReason: string | null;
  canResubmit: boolean | null;
  resubmitAvailableAt: string | null;
  bannedUntil?: string | null;
  banReason?: string | null;
  isBanned?: boolean;
  bannedAt?: string | null;
}

export interface GetStudentUsersParams {
  keyword?: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
  page?: number;
  size?: number;
}

export interface PaginatedStudentUsers {
  content: StudentUser[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const StudentUserService = {
  getUsers: async (params?: GetStudentUsersParams): Promise<PaginatedStudentUsers> => {
    const response = await api.get('/v1/admin/users', { params });
    return response.data;
  },

  banUser: async (id: number, payload: { reason: string; bannedUntil?: string | null }): Promise<StudentUser> => {
    const response = await api.patch(`/v1/admin/users/${id}/ban`, payload);
    return response.data;
  },

  unbanUser: async (id: number): Promise<StudentUser> => {
    const response = await api.patch(`/v1/admin/users/${id}/unban`);
    return response.data;
  },
};
