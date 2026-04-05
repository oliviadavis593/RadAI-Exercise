import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from './usePagination'

const items = Array.from({ length: 55 }, (_, i) => i + 1) // [1..55]

describe('usePagination', () => {
  it('returns first page items on initial render', () => {
    const { result } = renderHook(() => usePagination(items, 25, null))
    expect(result.current.pageItems).toEqual(items.slice(0, 25))
    expect(result.current.page).toBe(1)
  })

  it('calculates totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(items, 25, null))
    expect(result.current.totalPages).toBe(3) // ceil(55/25) = 3
  })

  it('returns correct items for page 2', () => {
    const { result } = renderHook(() => usePagination(items, 25, null))
    act(() => result.current.setPage(2))
    expect(result.current.pageItems).toEqual(items.slice(25, 50))
    expect(result.current.page).toBe(2)
  })

  it('returns partial last page', () => {
    const { result } = renderHook(() => usePagination(items, 25, null))
    act(() => result.current.setPage(3))
    expect(result.current.pageItems).toHaveLength(5) // 55 - 50 = 5
    expect(result.current.endIndex).toBe(55)
  })

  it('clamps page to totalPages when items shrink', () => {
    const { result, rerender } = renderHook(
      ({ data, key }: { data: number[]; key: unknown }) => usePagination(data, 25, key),
      { initialProps: { data: items, key: 'a' } },
    )
    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    // Shrink dataset to 10 items — page 3 no longer exists
    rerender({ data: items.slice(0, 10), key: 'a' })
    expect(result.current.page).toBe(1) // safePage clamps to 1
  })

  it('resets to page 1 when resetKey changes', () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: unknown }) => usePagination(items, 25, key),
      { initialProps: { key: 'initial' } },
    )
    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)

    rerender({ key: 'changed' })
    expect(result.current.page).toBe(1)
  })

  it('returns totalItems count', () => {
    const { result } = renderHook(() => usePagination(items, 25, null))
    expect(result.current.totalItems).toBe(55)
  })

  it('handles empty items', () => {
    const { result } = renderHook(() => usePagination([], 25, null))
    expect(result.current.pageItems).toEqual([])
    expect(result.current.totalPages).toBe(1)
    expect(result.current.page).toBe(1)
  })

  it('handles items count exactly equal to pageSize', () => {
    const exact = Array.from({ length: 25 }, (_, i) => i)
    const { result } = renderHook(() => usePagination(exact, 25, null))
    expect(result.current.totalPages).toBe(1)
    expect(result.current.pageItems).toHaveLength(25)
  })
})
