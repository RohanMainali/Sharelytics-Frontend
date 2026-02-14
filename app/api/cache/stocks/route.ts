import { NextResponse } from "next/server"
import {
  getCachedStockList,
  startHeartbeat,
  isHeartbeatRunning,
  dataCache,
} from "@/lib/cache"

/**
 * GET /api/cache/stocks
 *
 * Returns the cached enriched stock list.
 * Also ensures the heartbeat is running.
 */
export async function GET() {
  try {
    // Ensure heartbeat is running on first request
    if (!isHeartbeatRunning()) {
      startHeartbeat()
    }

    const stocks = await getCachedStockList()

    return NextResponse.json({
      stocks,
      timestamp: dataCache.stockList?.timestamp ?? Date.now(),
      count: stocks.length,
      cached: !!dataCache.stockList,
    })
  } catch (error) {
    console.error("[API] Error fetching cached stocks:", error)
    return NextResponse.json({ error: "Failed to fetch stocks", stocks: [] }, { status: 500 })
  }
}
