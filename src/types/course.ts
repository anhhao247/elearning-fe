export interface Course {
  id: number
  title: string
  description?: string
  shortDescription?: string
  thumbnail?: string | null
  price: number
  isFree?: boolean
  level: string
  categoryId?: number
  categoryName?: string
  instructorName?: string
  createdAt: string
  updatedAt?: string
}

export interface PageResponse<T> {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
