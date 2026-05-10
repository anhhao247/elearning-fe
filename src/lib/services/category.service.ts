import { api } from '../axios';
import { Category } from '@/types/category';
import { PaginatedResponse } from '@/types/common';

export interface GetCategoriesParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface CategoryPayload {
  name: string;
  description: string;
  isActive: boolean;
  parentId?: number | null;
}

export const CategoryService = {
  getCategories: async (params: GetCategoriesParams): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/v1/admin/categories', { params });
    return response.data;
  },

  createCategory: async (payload: CategoryPayload): Promise<Category> => {
    const response = await api.post('/v1/admin/categories', payload);
    return response.data;
  },

  updateCategory: async (id: number, payload: CategoryPayload): Promise<Category> => {
    const response = await api.put(`/v1/admin/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/categories/${id}`);
  },
};
