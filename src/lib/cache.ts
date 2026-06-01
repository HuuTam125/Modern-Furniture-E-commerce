// src/lib/cache.ts
import { redis } from './redis'
/**
 * Cache-aside pattern: thử lấy từ cache trước, nếu miss thì gọi fn() rồi set cache
 * @param key    - Redis cache key
 * @param ttl    - Time to live (giây)
 * @param fn     - Async function trả về data nếu cache miss
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  //Kiểm tra redis có key chưa
  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as T
  } catch (err) {
    // Nếu Redis lỗi, fallback về fn() — không gây app crash
    console.error('[Cache] Read error:', err)
  }

  //Chưa có -> Set key cho redis
  const data = await fn()
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (err) {
    console.error('[Cache] Write error:', err)
  }
  return data
}

/**
 * Xóa cache theo key hoặc pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (err) {
    console.error('[Cache] Invalidate error:', err)
  }
}

// Cache keys constants — tập trung để dễ manage
export const CACHE_KEYS = {
  PRODUCT: (slug: string) => `product:${slug}`,
  PRODUCTS_LIST: (params: string) => `products:list:${params}`,
  CATEGORIES: 'categories:all',
  FLASH_SALE_ACTIVE: 'flash_sale:active',
  BEST_SELLERS: 'best_sellers',
  SEARCH: (q: string) => `search:${q.toLowerCase().trim()}`,
} as const

export const CACHE_TTL = {
  PRODUCT: 300, // 5 phút
  CATEGORIES: 3600, // 1 giờ
  FLASH_SALE: 60, // 1 phút
  BEST_SELLERS: 3600, // 1 giờ
  SEARCH: 300, // 5 phút
} as const
