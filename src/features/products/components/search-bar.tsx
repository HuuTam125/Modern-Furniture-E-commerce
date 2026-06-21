// src/features/products/components/search-bar.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { searchProductSuggestions } from '@/actions/product.actions'
import { formatPrice } from '@/lib/utils'

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => searchProductSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    setIsOpen(false)
    setQuery('')
  }

  function handleSelectSuggestion(slug: string) {
    router.push(`/product/${slug}`)
    setIsOpen(false)
    setQuery('')
  }

  const showDropdown = isOpen && debouncedQuery.length >= 2

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm kiếm nội thất..."
            className="pr-9 pl-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="text-muted-foreground h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="text-muted-foreground p-3 text-center text-sm">
              Đang tìm kiếm...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul>
              {suggestions.map((product) => (
                <li key={product.id}>
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    onClick={() => handleSelectSuggestion(product.slug)}
                  >
                    {product.images[0] && (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatPrice(Number(product.basePrice))}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
              <li className="border-t">
                <button
                  className="text-muted-foreground w-full px-3 py-2 text-center text-sm hover:bg-gray-50"
                  onClick={() => {
                    router.push(`/products?q=${encodeURIComponent(query)}`)
                    setIsOpen(false)
                  }}
                >
                  {`Xem tất cả kết quả cho "${query}"`}
                </button>
              </li>
            </ul>
          ) : (
            <div className="text-muted-foreground p-3 text-center text-sm">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      )}
    </div>
  )
}
