"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, RotateCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MOCK_CATEGORIES = [
  { id: 1, name: "Lập trình", count: 120 },
  { id: 2, name: "Thiết kế UI/UX", count: 45 },
  { id: 3, name: "Kinh doanh", count: 80 },
  { id: 4, name: "Digital Marketing", count: 65 },
]

export function CourseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultKeyword = searchParams.get("keyword") || ""
  const defaultLevel = searchParams.get("level") || "ALL"
  const defaultIsFree = searchParams.get("isFree") || "ALL"
  const defaultCategoryId = searchParams.get("categoryId") || "ALL"

  // We leave sort in CourseFilters for now, maybe at the very top or bottom
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

    newParams.set("page", "0")
    
    router.push(`/courses?${newParams.toString()}`)
  }, [router, searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ keyword })
  }

  const clearAllFilters = () => {
    setKeyword("")
    router.push("/courses")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Bộ lọc</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-primary h-8 px-2 hover:bg-primary/10">
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Xóa tất cả
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm khóa học..."
            className="pl-8 bg-background"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </form>

      <Separator />

      {/* Sắp xếp (Sort) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Sắp xếp theo</h4>
        <div className="flex flex-col gap-2">
          <Select 
            value={`${defaultSortBy}-${defaultSortDir}`} 
            onValueChange={(val) => {
              const [sortBy, sortDir] = val.split("-")
              applyFilters({ sortBy, sortDir })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mới nhất" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
              <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
              <SelectItem value="price-asc">Giá (Thấp đến Cao)</SelectItem>
              <SelectItem value="price-desc">Giá (Cao đến Thấp)</SelectItem>
              <SelectItem value="title-asc">Tên (A-Z)</SelectItem>
              <SelectItem value="title-desc">Tên (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Danh mục (Categories) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Danh mục</h4>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cat-all" 
              checked={defaultCategoryId === "ALL"}
              onCheckedChange={() => applyFilters({ categoryId: "ALL" })}
            />
            <Label htmlFor="cat-all" className="flex-1 cursor-pointer font-normal">Tất cả danh mục</Label>
          </div>
          {MOCK_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat.id}`} 
                checked={defaultCategoryId === String(cat.id)}
                onCheckedChange={(checked) => applyFilters({ categoryId: checked ? String(cat.id) : "ALL" })}
              />
              <Label htmlFor={`cat-${cat.id}`} className="flex-1 cursor-pointer font-normal flex justify-between">
                <span>{cat.name}</span>
                <span className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded-full">{cat.count}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Trình độ (Level) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Trình độ</h4>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="level-all" 
              checked={defaultLevel === "ALL"}
              onCheckedChange={() => applyFilters({ level: "ALL" })}
            />
            <Label htmlFor="level-all" className="flex-1 cursor-pointer font-normal">Tất cả trình độ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="level-beg" 
              checked={defaultLevel === "BEGINNER"}
              onCheckedChange={(c) => applyFilters({ level: c ? "BEGINNER" : "ALL" })}
            />
            <Label htmlFor="level-beg" className="flex-1 cursor-pointer font-normal">Sơ cấp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="level-int" 
              checked={defaultLevel === "INTERMEDIATE"}
              onCheckedChange={(c) => applyFilters({ level: c ? "INTERMEDIATE" : "ALL" })}
            />
            <Label htmlFor="level-int" className="flex-1 cursor-pointer font-normal">Trung cấp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="level-adv" 
              checked={defaultLevel === "ADVANCED"}
              onCheckedChange={(c) => applyFilters({ level: c ? "ADVANCED" : "ALL" })}
            />
            <Label htmlFor="level-adv" className="flex-1 cursor-pointer font-normal">Cao cấp</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Giá (Price) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Giá khóa học</h4>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="price-all" 
              checked={defaultIsFree === "ALL"}
              onCheckedChange={() => applyFilters({ isFree: "ALL" })}
            />
            <Label htmlFor="price-all" className="flex-1 cursor-pointer font-normal">Tất cả</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="price-free" 
              checked={defaultIsFree === "true"}
              onCheckedChange={(c) => applyFilters({ isFree: c ? "true" : "ALL" })}
            />
            <Label htmlFor="price-free" className="flex-1 cursor-pointer font-normal">Miễn phí</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="price-paid" 
              checked={defaultIsFree === "false"}
              onCheckedChange={(c) => applyFilters({ isFree: c ? "false" : "ALL" })}
            />
            <Label htmlFor="price-paid" className="flex-1 cursor-pointer font-normal">Trả phí</Label>
          </div>
        </div>
      </div>
      
    </div>
  )
}