export interface Affiliations {
  organizations: string[]
}

export interface InstructorApplication {
  profileId: number
  userId: number
  username: string
  email: string
  firstName: string
  lastName: string
  headline: string
  bio: string
  affiliations: Affiliations | string[] // Support both JSON object and simple string array
  websiteUrl: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  offset: number
  paged: boolean
  unpaged: boolean
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}
