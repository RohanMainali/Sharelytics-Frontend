import { NextRequest, NextResponse } from "next/server"
import {
  fullRefresh,
  refreshMerolaganiDetail,
  refreshTechnicalData,
  refreshPriceHistory,
  refreshNews,
  startHeartbeat,
  isHeartbeatRunning,
  getCacheStatus,
} from "@/lib/cache"

/**
 * POST /api/cache/refresh
 *
 * Force-refresh the cache. Optionally specify what to refresh via body:
 *   { type: "all" | "stocks" | "news" | "stock" | "technical" | "price-history", symbol?: string }
 *
 * Default is "all" (full refresh of stocks + news).
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure heartbeat is running
    if (!isHeartbeatRunning()) {
      startHeartbeat()
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // No body provided — do full refresh
    }

    const type = body?.type || "all"
    const symbol = body?.symbol?.toUpperCase()

    switch (type) {
      case "all":
        await fullRefresh()
        break
      case "stocks":
        const { refreshStockList } = await import("@/lib/cache")
        await refreshStockList()
        break
      case "news":
        await refreshNews()
        break
      case "stock":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol required for stock refresh" }, { status: 400 })
        }
        await refreshMerolaganiDetail(symbol)
        break
      case "technical":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol required for technical refresh" }, { status: 400 })
        }
        await refreshTechnicalData(symbol)
        break
      case "price-history":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol required for price-history refresh" }, { status: 400 })
        }
        await refreshPriceHistory(symbol)
        break
      default:
        return NextResponse.json({ error: `Unknown refresh type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      symbol,
      status: getCacheStatus(),
    })
  } catch (error) {
    console.error("[API] Error during cache refresh:", error)
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}

/**
 * GET /api/cache/refresh
 *
 * Returns the current cache status.
 */
export async function GET() {
  return NextResponse.json(getCacheStatus())
}
