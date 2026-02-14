/**
 * Client-side helpers for fetching data from the server-side cache API.
 * Components use these instead of calling server actions directly.
 */

import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"
import type { MerolaganiStock } from "@/app/actions/fetch-merolagani-data"
import type { NewsItem } from "@/app/actions/fetch-market-news"
import type { TechnicalIndicators } from "@/app/actions/fetch-technical-data"
import type { SharehubPriceHistory } from "@/app/actions/fetch-sharehub-price-history"

export interface EnrichedStock extends SharesansarStock {
  eps: string | number
  bookValue: string | number
  pbv: string | number
  peRatio: string | number
}

// ---------------------------------------------------------------------------
// Fetch from cache API
// ---------------------------------------------------------------------------

/** Fetch enriched stock list from cache */
export async function fetchCachedStocks(): Promise<{
  stocks: EnrichedStock[]
  timestamp: number
}> {
  const res = await fetch("/api/cache/stocks")
  if (!res.ok) throw new Error("Failed to fetch cached stocks")
  const json = await res.json()
  return { stocks: json.stocks, timestamp: json.timestamp }
}

/** Fetch cached news */
export async function fetchCachedNews(): Promise<{
  news: NewsItem[]
  timestamp: number
}> {
  const res = await fetch("/api/cache/news")
  if (!res.ok) throw new Error("Failed to fetch cached news")
  const json = await res.json()
  return { news: json.news, timestamp: json.timestamp }
}

/** Fetch cached merolagani detail for a symbol */
export async function fetchCachedStockDetail(symbol: string): Promise<{
  data: MerolaganiStock
  timestamp: number
}> {
  const res = await fetch(`/api/cache/stock/${encodeURIComponent(symbol)}`)
  if (!res.ok) throw new Error(`Failed to fetch cached detail for ${symbol}`)
  const json = await res.json()
  return { data: json.data, timestamp: json.timestamp }
}

/** Fetch cached technical data for a symbol */
export async function fetchCachedTechnicalData(symbol: string): Promise<{
  data: TechnicalIndicators | null
  timestamp: number
}> {
  const res = await fetch(`/api/cache/technical/${encodeURIComponent(symbol)}`)
  if (!res.ok) throw new Error(`Failed to fetch cached technical data for ${symbol}`)
  const json = await res.json()
  return { data: json.data, timestamp: json.timestamp }
}

/** Fetch cached price history for a symbol */
export async function fetchCachedPriceHistory(symbol: string): Promise<{
  data: SharehubPriceHistory[]
  timestamp: number
}> {
  const res = await fetch(`/api/cache/price-history/${encodeURIComponent(symbol)}`)
  if (!res.ok) throw new Error(`Failed to fetch cached price history for ${symbol}`)
  const json = await res.json()
  return { data: json.data, timestamp: json.timestamp }
}

// ---------------------------------------------------------------------------
// Trigger refresh
// ---------------------------------------------------------------------------

export type RefreshType = "all" | "stocks" | "news" | "stock" | "technical" | "price-history"

/**
 * Force refresh the server cache.
 * @param type What to refresh (default: "all")
 * @param symbol Required for stock/technical/price-history types
 */
export async function triggerCacheRefresh(
  type: RefreshType = "all",
  symbol?: string
): Promise<void> {
  const res = await fetch("/api/cache/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, symbol }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Cache refresh failed")
  }
}

/** Fetch multiple merolagani details from cache (for watchlist) */
export async function fetchCachedMultipleStockDetails(
  symbols: string[]
): Promise<MerolaganiStock[]> {
  const results = await Promise.allSettled(
    symbols.map((s) => fetchCachedStockDetail(s))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<{ data: MerolaganiStock; timestamp: number }> =>
      r.status === "fulfilled"
    )
    .map((r) => r.value.data)
}
