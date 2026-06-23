// src/features/admin/components/admin-product-table.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatPrice } from '@/lib/utils'
import {
  toggleProductPublish,
  deleteProduct,
} from '@/actions/admin/product.actions'
import type { AdminProductListItem } from '@/types/product'
import { useRouter } from 'next/navigation'

interface AdminProductTableProps {
  products: AdminProductListItem[]
  totalPages: number
  currentPage: number
}

export function AdminProductTable({
  products,
  totalPages,
  currentPage,
}: AdminProductTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleTogglePublish(id: string, current: boolean) {
    const result = await toggleProductPublish(id, !current)
    if (result.success) {
      toast.success(current ? 'Đã ẩn sản phẩm' : 'Đã đăng sản phẩm')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteProduct(id)
    if (result.success) {
      toast.success('Đã xóa sản phẩm')
      router.refresh()
    } else {
      toast.error(result.error)
    }
    setDeletingId(null)
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75">Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center"
                >
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const mainImage = product.images[0]
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                )
                const minPrice = Math.min(
                  ...product.variants.map((v) => Number(v.price)),
                )

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {mainImage && (
                            <Image
                              src={mainImage.url}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {product.variants.length} variant
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map(({ category }) => (
                          <Badge
                            key={category.name}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatPrice(minPrice)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          totalStock === 0 ? 'text-sm text-red-500' : 'text-sm'
                        }
                      >
                        {totalStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isPublished ? 'default' : 'secondary'}
                      >
                        {product.isPublished ? 'Đã đăng' : 'Nháp'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/products/${product.id}/edit`}
                            >
                              <Edit className="mr-2 h-3.5 w-3.5" />
                              Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleTogglePublish(
                                product.id,
                                product.isPublished,
                              )
                            }
                          >
                            {product.isPublished ? (
                              <>
                                <EyeOff className="mr-2 h-3.5 w-3.5" />
                                Ẩn sản phẩm
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                Đăng sản phẩm
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(product.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Sản phẩm sẽ bị ẩn khỏi cửa hàng. Dữ liệu đơn hàng liên quan vẫn
              được giữ lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
