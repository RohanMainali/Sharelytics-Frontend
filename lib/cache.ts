/**
 * Server-side in-memory cache with heartbeat refresh.
 *
 * - All scraped data is stored in a global in-memory Map that survives
 *   across requests (persists as long as the Node process is alive).
 * - A background heartbeat re-scrapes data every HEARTBEAT_INTERVAL ms.
 * - The frontend reads from the cache (instant) and never scrapes directly.
 * - A manual refresh endpoint can force an immediate re-scrape.
 */

import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"
import type { MerolaganiStock } from "@/app/actions/fetch-merolagani-data"
import type { NewsItem } from "@/app/actions/fetch-market-news"
import type { TechnicalIndicators } from "@/app/actions/fetch-technical-data"
import type { SharehubPriceHistory } from "@/app/actions/fetch-sharehub-price-history"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CacheEntry<T> {
  data: T
  timestamp: number
  refreshing: boolean
}

export interface EnrichedStock extends SharesansarStock {
  eps: string | number
  bookValue: string | number
  pbv: string | number
  peRatio: string | number
}

export interface CacheStatus {
  stockList: { cached: boolean; timestamp: number | null; count: number }
  merolaganiDetails: { cached: boolean; count: number }
  news: { cached: boolean; timestamp: number | null; count: number }
  technicalData: { cached: boolean; count: number }
  priceHistory: { cached: boolean; count: number }
  heartbeatRunning: boolean
  lastHeartbeat: number | null
}

// ---------------------------------------------------------------------------
// Global singleton cache (survives hot‑reloads in dev via globalThis)
// ---------------------------------------------------------------------------

const HEARTBEAT_INTERVAL = 2 * 60 * 1000 // 2 minutes

// We attach to globalThis so the cache survives Next.js hot‑reloads in dev
const g = globalThis as any

if (!g.__sharelytics_cache) {
  g.__sharelytics_cache = {
    /** Full list of stocks from sharesansar (enriched with merolagani data) */
    stockList: null as CacheEntry<EnrichedStock[]> | null,

    /** Individual merolagani detail keyed by symbol */
    merolaganiDetails: new Map<string, CacheEntry<MerolaganiStock>>(),

    /** Market news */
    news: null as CacheEntry<NewsItem[]> | null,

    /** Technical data keyed by symbol */
    technicalData: new Map<string, CacheEntry<TechnicalIndicators | null>>(),

    /** Price history keyed by symbol */
    priceHistory: new Map<string, CacheEntry<SharehubPriceHistory[]>>(),

    /** Heartbeat interval id */
    heartbeatId: null as ReturnType<typeof setInterval> | null,

    /** Timestamp of last heartbeat run */
    lastHeartbeat: null as number | null,

    /** Whether a full refresh is currently running */
    refreshing: false,
  }
}

export const dataCache = g.__sharelytics_cache as {
  stockList: CacheEntry<EnrichedStock[]> | null
  merolaganiDetails: Map<string, CacheEntry<MerolaganiStock>>
  news: CacheEntry<NewsItem[]> | null
  technicalData: Map<string, CacheEntry<TechnicalIndicators | null>>
  priceHistory: Map<string, CacheEntry<SharehubPriceHistory[]>>
  heartbeatId: ReturnType<typeof setInterval> | null
  lastHeartbeat: number | null
  refreshing: boolean
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

/** Check if a cache entry is still fresh (within maxAge ms, default 3 min) */
export function isFresh<T>(entry: CacheEntry<T> | null | undefined, maxAgeMs = 3 * 60 * 1000): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < maxAgeMs
}

/** Wrap data into a CacheEntry */
export function makeCacheEntry<T>(data: T): CacheEntry<T> {
  return { data, timestamp: Date.now(), refreshing: false }
}

// ---------------------------------------------------------------------------
// Refresh functions (do the actual scraping)
// ---------------------------------------------------------------------------

/**
 * Refresh the main stock list:
 * 1. Fetch live trading data from sharesansar
 * 2. Fetch merolagani fundamentals for each stock (batched)
 * 3. Merge into enriched stock list
 */
export async function refreshStockList(): Promise<EnrichedStock[]> {
  // Dynamic imports so this file can be imported on both server and client
  // but the actual scraping only runs server-side
  const { fetchSharesansarData } = await import("@/app/actions/fetch-sharesansar-data")
  const { fetchMultipleMerolaganiData } = await import("@/app/actions/fetch-merolagani-data")

  console.log("[Cache] Refreshing stock list...")
  const startTime = Date.now()

  const data = await fetchSharesansarData()

  // Batch merolagani requests in groups of 10 to avoid overwhelming the server
  const BATCH_SIZE = 10
  const symbols = data.map((s) => s.symbol)
  const allFundamentals: MerolaganiStock[] = []

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE)
    try {
      const batchResults = await fetchMultipleMerolaganiData(batch)
      allFundamentals.push(...batchResults)
    } catch (err) {
      console.error(`[Cache] Error fetching merolagani batch ${i}-${i + BATCH_SIZE}:`, err)
    }
  }

  const fundamentalsBySymbol = new Map(allFundamentals.map((s) => [s.symbol, s]))

  const enrichedStocks: EnrichedStock[] = data.map((stock) => {
    const fundamental = fundamentalsBySymbol.get(stock.symbol)
    return {
      ...stock,
      eps: fundamental?.eps ?? "N/A",
      bookValue: fundamental?.bookValue ?? "N/A",
      pbv: fundamental?.pbv ?? "N/A",
      peRatio: fundamental?.peRatio ?? "N/A",
    }
  })

  // Store each merolagani detail individually too
  for (const f of allFundamentals) {
    dataCache.merolaganiDetails.set(f.symbol, makeCacheEntry(f))
  }

  dataCache.stockList = makeCacheEntry(enrichedStocks)
  console.log(`[Cache] Stock list refreshed: ${enrichedStocks.length} stocks in ${Date.now() - startTime}ms`)
  return enrichedStocks
}

/** Refresh market news */
export async function refreshNews(): Promise<NewsItem[]> {
  const { fetchMarketNews } = await import("@/app/actions/fetch-market-news")
  console.log("[Cache] Refreshing news...")
  const news = await fetchMarketNews()
  dataCache.news = makeCacheEntry(news)
  console.log(`[Cache] News refreshed: ${news.length} items`)
  return news
}

/** Refresh technical data for a specific symbol */
export async function refreshTechnicalData(symbol: string): Promise<TechnicalIndicators | null> {
  const { fetchTechnicalData } = await import("@/app/actions/fetch-technical-data")
  console.log(`[Cache] Refreshing technical data for ${symbol}...`)
  const data = await fetchTechnicalData(symbol)
  dataCache.technicalData.set(symbol, makeCacheEntry(data))
  return data
}

/** Refresh merolagani detail for a specific symbol */
export async function refreshMerolaganiDetail(symbol: string): Promise<MerolaganiStock> {
  const { fetchMerolaganiData } = await import("@/app/actions/fetch-merolagani-data")
  console.log(`[Cache] Refreshing merolagani detail for ${symbol}...`)
  const data = await fetchMerolaganiData(symbol)
  dataCache.merolaganiDetails.set(symbol, makeCacheEntry(data))
  return data
}

/** Refresh price history for a specific symbol */
export async function refreshPriceHistory(symbol: string): Promise<SharehubPriceHistory[]> {
  const { fetchSharehubPriceHistory } = await import("@/app/actions/fetch-sharehub-price-history")
  console.log(`[Cache] Refreshing price history for ${symbol}...`)
  const data = await fetchSharehubPriceHistory(symbol)
  dataCache.priceHistory.set(symbol, makeCacheEntry(data))
  return data
}

// ---------------------------------------------------------------------------
// Full refresh (called by heartbeat and manual refresh)
// ---------------------------------------------------------------------------

export async function fullRefresh(): Promise<void> {
  if (dataCache.refreshing) {
    console.log("[Cache] Refresh already in progress, skipping...")
    return
  }

  dataCache.refreshing = true
  try {
    // Refresh stock list and news in parallel
    await Promise.allSettled([refreshStockList(), refreshNews()])
    dataCache.lastHeartbeat = Date.now()
  } catch (err) {
    console.error("[Cache] Error during full refresh:", err)
  } finally {
    dataCache.refreshing = false
  }
}

// ---------------------------------------------------------------------------
// Heartbeat management
// ---------------------------------------------------------------------------

export function startHeartbeat(): void {
  if (dataCache.heartbeatId) {
    console.log("[Cache] Heartbeat already running")
    return
  }

  console.log(`[Cache] Starting heartbeat (every ${HEARTBEAT_INTERVAL / 1000}s)`)

  // Do an initial refresh immediately
  fullRefresh()

  // Then set up the interval
  dataCache.heartbeatId = setInterval(() => {
    fullRefresh()
  }, HEARTBEAT_INTERVAL)
}

export function stopHeartbeat(): void {
  if (dataCache.heartbeatId) {
    clearInterval(dataCache.heartbeatId)
    dataCache.heartbeatId = null
    console.log("[Cache] Heartbeat stopped")
  }
}

export function isHeartbeatRunning(): boolean {
  return dataCache.heartbeatId !== null
}

// ---------------------------------------------------------------------------
// Getters (read from cache, optionally trigger refresh if stale)
// ---------------------------------------------------------------------------

/** Get cached stock list. If not cached, triggers refresh and waits. */
export async function getCachedStockList(): Promise<EnrichedStock[]> {
  if (dataCache.stockList && isFresh(dataCache.stockList)) {
    return dataCache.stockList.data
  }

  // If cache is stale but exists, return stale data and trigger background refresh
  if (dataCache.stockList) {
    // Trigger background refresh (don't await)
    refreshStockList().catch(console.error)
    return dataCache.stockList.data
  }

  // No cache at all — must wait for fresh data
  return refreshStockList()
}

/** Get cached news */
export async function getCachedNews(): Promise<NewsItem[]> {
  if (dataCache.news && isFresh(dataCache.news, 5 * 60 * 1000)) {
    return dataCache.news.data
  }

  if (dataCache.news) {
    refreshNews().catch(console.error)
    return dataCache.news.data
  }

  return refreshNews()
}

/** Get cached merolagani detail for a symbol */
export async function getCachedMerolaganiDetail(symbol: string): Promise<MerolaganiStock> {
  const entry = dataCache.merolaganiDetails.get(symbol)

  if (entry && isFresh(entry)) {
    return entry.data
  }

  if (entry) {
    refreshMerolaganiDetail(symbol).catch(console.error)
    return entry.data
  }

  return refreshMerolaganiDetail(symbol)
}

/** Get cached technical data for a symbol */
export async function getCachedTechnicalData(symbol: string): Promise<TechnicalIndicators | null> {
  const entry = dataCache.technicalData.get(symbol)

  if (entry && isFresh(entry, 5 * 60 * 1000)) {
    return entry.data
  }

  if (entry) {
    refreshTechnicalData(symbol).catch(console.error)
    return entry.data
  }

  return refreshTechnicalData(symbol)
}

/** Get cached price history for a symbol */
export async function getCachedPriceHistory(symbol: string): Promise<SharehubPriceHistory[]> {
  const entry = dataCache.priceHistory.get(symbol)

  // Price history is less volatile, cache for 10 minutes
  if (entry && isFresh(entry, 10 * 60 * 1000)) {
    return entry.data
  }

  if (entry) {
    refreshPriceHistory(symbol).catch(console.error)
    return entry.data
  }

  return refreshPriceHistory(symbol)
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export function getCacheStatus(): CacheStatus {
  return {
    stockList: {
      cached: !!dataCache.stockList,
      timestamp: dataCache.stockList?.timestamp ?? null,
      count: dataCache.stockList?.data.length ?? 0,
    },
    merolaganiDetails: {
      cached: dataCache.merolaganiDetails.size > 0,
      count: dataCache.merolaganiDetails.size,
    },
    news: {
      cached: !!dataCache.news,
      timestamp: dataCache.news?.timestamp ?? null,
      count: dataCache.news?.data.length ?? 0,
    },
    technicalData: {
      cached: dataCache.technicalData.size > 0,
      count: dataCache.technicalData.size,
    },
    priceHistory: {
      cached: dataCache.priceHistory.size > 0,
      count: dataCache.priceHistory.size,
    },
    heartbeatRunning: isHeartbeatRunning(),
    lastHeartbeat: dataCache.lastHeartbeat,
  }
}
