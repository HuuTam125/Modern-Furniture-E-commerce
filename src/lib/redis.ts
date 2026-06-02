// src/lib/redis.ts
import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })

  client.on('error', (err) => {
    // Không crash app nếu Redis lỗi — chỉ log
    console.error('[Redis] Connection error:', err)
  })

  client.on('connect', () => {
    console.log('[Redis] Connected successfully')
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
