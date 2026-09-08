"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CourseSort() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultSortBy = searchParams.get("sortBy") || "createdAt"
  const defaultSortDir = searchParams.get("sortDir") || "desc"

  const applySort = useCallback((sortBy: string, sortDir: string) => {
    const newParams = new URLSearchParams(Array.from(searchParams.entries()))
    newParams.set("sortBy", sortBy)
    newParams.set("sortDir", sortDir)
    newParams.set("page", "0")
    router.push(`/courses?${newParams.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">Sắp xếp theo:</span>
      <Select
        value={`${defaultSortBy}-${defaultSortDir}`}
        onValueChange={(val) => {
          const [sortBy, sortDir] = val.split("-")
          applySort(sortBy, sortDir)
        }}
      >
        <SelectTrigger aria-label="Sắp xếp danh sách khóa học" className="w-[180px] h-9 text-xs bg-background">
          <SelectValue placeholder="Mới nhất" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
          <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
          <SelectItem value="price-asc">Giá tăng dần</SelectItem>
          <SelectItem value="price-desc">Giá giảm dần</SelectItem>
          <SelectItem value="title-asc">Tên (A-Z)</SelectItem>
          <SelectItem value="title-desc">Tên (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
