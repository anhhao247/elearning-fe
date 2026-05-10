"use client"

import { useState } from "react"
import { 
  useAdminCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/hooks/queries/use-admin-categories"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryDialog } from "./_components/category-dialog"
import { Category } from "@/types/category"
import { CategoryPayload } from "@/lib/services/category.service"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

export default function AdminCategoriesPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [keyword, setKeyword] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  // Alert dialog state for delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useAdminCategories({
    page: pageIndex,
    size: 10,
    keyword: keyword || undefined,
    isActive: isActive,
  })

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
    setPageIndex(0)
  }

  const handleFilterActive = (newIsActive: boolean | undefined) => {
    setIsActive(newIsActive)
    setPageIndex(0)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setCategoryIdToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (categoryIdToDelete) {
      await deleteMutation.mutateAsync(categoryIdToDelete)
      setDeleteDialogOpen(false)
      setCategoryIdToDelete(null)
    }
  }

  const handleSubmit = async (payload: CategoryPayload) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage course categories in the system.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {isError ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <p>Failed to load categories.</p>
          <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          pageCount={data?.totalPages || 0}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          loading={isLoading}
          onSearch={handleSearch}
          onFilterActive={handleFilterActive}
          meta={{
            onEdit: handleEdit,
            onDelete: handleDeleteClick,
          }}
        />
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
