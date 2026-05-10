export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  parentName: string | null;
  courseCount: number;
}
