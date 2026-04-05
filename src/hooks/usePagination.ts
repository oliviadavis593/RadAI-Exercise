import { useState, useEffect } from 'react'

export const PAGE_SIZE = 25

export interface PaginationResult<T> {
  pageItems: T[]
  page: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  setPage: (page: number) => void
}

// resetKey: when this value changes (e.g. filter state), page resets to 1.
// Using unknown so callers can pass any serializable value without casting.
export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey: unknown,
): PaginationResult<T> {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, items.length)
  const pageItems = items.slice(startIndex, endIndex)

  return {
    pageItems,
    page: safePage,
    totalPages,
    totalItems: items.length,
    startIndex,
    endIndex,
    setPage,
  }
}
