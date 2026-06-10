import { api } from "@/lib/axios"

export type ReportTargetType = "COURSE" | "CONTENT"
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED"
export type ReportResolveAction = "DISMISS"

export interface Report {
  id: number
  reporterId: number
  reporterUsername: string
  targetType: ReportTargetType
  targetId: number
  reason: string
  description: string | null
  status: ReportStatus
  reviewedById: number | null
  reviewedByUsername: string | null
  reviewedAt: string | null
  resolutionNote: string | null
  createdAt: string
  updatedAt: string
}

export interface ReportTargetContent {
  id: number
  title: string
  description: string | null
  contentType: "READING" | "VIDEO" | "QUIZ"
  contentOrder: number
  videoDetails: {
    platform: string | null
    platformVideoId: string | null
    duration: number | null
    streamUrl: string | null
    objectKey: string | null
    thumbnailUrl: string | null
    uploadStatus: string | null
    fileSize: number | null
  } | null
  readingDetails: {
    body: string
  } | null
  quizDetails: {
    description: string | null
    quizDuration: number | null
    passPercent: number | null
    questions: Array<{
      id: number
      questionText: string
      questionType: string
      options: Array<{
        id: number
        optionText: string
        isCorrect: boolean
      }>
    }>
  } | null
}

export interface CreateReportPayload {
  targetType: ReportTargetType
  targetId: number
  reason: string
  description?: string
}

export interface ReportResolutionPayload {
  resolutionNote: string
}

export interface GetAdminReportsParams {
  status?: ReportStatus
  targetType?: ReportTargetType
  page?: number
  size?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export interface PaginatedReports {
  content: Report[]
  pageable: {
    sort: { sorted: boolean; unsorted: boolean; empty: boolean }
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: { sorted: boolean; unsorted: boolean; empty: boolean }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export const ReportService = {
  createReport: async (payload: CreateReportPayload): Promise<Report> => {
    const response = await api.post("/v1/student/reports", payload)
    return response.data
  },

  getAdminReports: async (params?: GetAdminReportsParams): Promise<PaginatedReports> => {
    const response = await api.get("/v1/admin/reports", {
      params: {
        status: params?.status,
        target_type: params?.targetType,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDir: params?.sortDir,
      },
    })
    return response.data
  },

  getAdminReportDetail: async (reportId: number): Promise<Report> => {
    const response = await api.get(`/v1/admin/reports/${reportId}`)
    return response.data
  },

  getAdminReportTargetContent: async (reportId: number): Promise<ReportTargetContent> => {
    const response = await api.get(`/v1/admin/reports/${reportId}/target-content`)
    return response.data
  },

  resolveAdminReport: async (
    reportId: number,
    payload: { action: ReportResolveAction } & ReportResolutionPayload,
  ) => {
    const response = await api.post(`/v1/admin/reports/${reportId}/resolve`, payload)
    return response.data
  },

  hideReportCourse: async (reportId: number, payload: ReportResolutionPayload) => {
    const response = await api.post(`/v1/admin/reports/${reportId}/hide-course`, payload)
    return response.data
  },

  banReportInstructor: async (reportId: number, payload: ReportResolutionPayload) => {
    const response = await api.post(`/v1/admin/reports/${reportId}/ban-instructor`, payload)
    return response.data
  },
}
