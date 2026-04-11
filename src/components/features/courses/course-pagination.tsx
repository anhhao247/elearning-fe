"use client"

import { usePathname, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function CoursePagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 0

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  // Tạo ra danh sách trang để hiện
  const generatePagination = () => {
    // Basic logic for simplicity: show all if <= 5
    // Else show first, last, current, current - 1, current + 1
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    // P...CPN...L
    if (currentPage <= 2) {
      return [0, 1, 2, 3, "...", totalPages - 1]
    }

    if (currentPage >= totalPages - 3) {
      return [0, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1]
    }

    return [0, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1]
  }

  const allPages = generatePagination()

  return (
    <Pagination className="my-8">
      <PaginationContent>
        <PaginationItem>
          {currentPage > 0 ? (
            <PaginationPrevious href={createPageURL(currentPage - 1)} />
          ) : (
            <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>

        {allPages.map((page, index) => {
          if (page === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const pageNum = page as number
          return (
            <PaginationItem key={`page-${pageNum}`}>
              <PaginationLink
                href={createPageURL(pageNum)}
                isActive={currentPage === pageNum}
              >
                {pageNum + 1}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          {currentPage < totalPages - 1 ? (
            <PaginationNext href={createPageURL(currentPage + 1)} />
          ) : (
            <PaginationNext href="#" className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}