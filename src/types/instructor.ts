export interface InstructorProfile {
  profileId: number
  userId: number
  username: string
  firstName: string
  lastName: string
  avatar: string | null
  headline: string
  bio: string
  affiliations: {
    organizations: string[]
  }
  websiteUrl: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  totalStudents: number
  activeCourses: number
  averageRating: number
  createdAt: string
  updatedAt: string
}

export interface InstructorPublicCourse {
  id: number
  title: string
  thumbnail: string
  categoryName: string
  price: number
  isFree: boolean
  isPublish: boolean
  level: string
  updatedAt: string
}
