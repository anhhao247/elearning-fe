"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CourseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultKeyword = searchParams.get("keyword") || ""
  const defaultLevel = searchParams.get("level") || "ALL"
  const defaultIsFree = searchParams.get("isFree") || "ALL"
  const defaultSortBy = searchParams.get("sortBy") || "createdAt"
  const defaultSortDir = searchParams.get("sortDir") || "desc"

  const [keyword, setKeyword] = useState(defaultKeyword)

  const applyFilters = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.keys(updates).forEach((key) => {
      const val = updates[key]
      if (val === null || val === "ALL" || val === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, val)
      }
    })

    // Khi filter thay đổi, luôn trở về trang 0
    newParams.set("page", "0")
    
    router.push(`/courses?${newParams.toString()}`)
  }, [router, searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ keyword })
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm khóa học..."
            className="pl-8"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">Tìm</Button>
      </form>

      <div className="flex flex-wrap items-center gap-4">
        {/* Lọc: Trình độ */}
        <div className="flex flex-col gap-1.5 w-40 min-w-0">
          <Label className="text-xs text-muted-foreground">Trình độ</Label>
          <Select value={defaultLevel} onValueChange={(val) => applyFilters({ level: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="BEGINNER">Sơ cấp</SelectItem>
              <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
              <SelectItem value="ADVANCED">Cao cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc: Miễn phí / Có phí */}
        <div className="flex flex-col gap-1.5 w-40 min-w-0">
          <Label className="text-xs text-muted-foreground">Giá</Label>
          <Select value={defaultIsFree} onValueChange={(val) => applyFilters({ isFree: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="true">Miễn phí</SelectItem>
              <SelectItem value="false">Trả phí</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc: Sắp xếp theo (Field) */}
        <div className="flex flex-col gap-1.5 w-40 min-w-0">
          <Label className="text-xs text-muted-foreground">Sắp xếp theo</Label>
          <Select value={defaultSortBy} onValueChange={(val) => applyFilters({ sortBy: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Ngày tạo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Ngày tạo</SelectItem>
              <SelectItem value="price">Giá</SelectItem>
              <SelectItem value="title">Tên khóa học</SelectItem>
              <SelectItem value="level">Trình độ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc: Chiều sắp xếp (Direction) */}
        <div className="flex flex-col gap-1.5 w-40 min-w-0">
          <Label className="text-xs text-muted-foreground">Thứ tự</Label>
          <Select value={defaultSortDir} onValueChange={(val) => applyFilters({ sortDir: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Giảm dần" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Giảm dần (Z-A)</SelectItem>
              <SelectItem value="asc">Tăng dần (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}