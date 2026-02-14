import { NextRequest, NextResponse } from "next/server"
import { getCachedPriceHistory, dataCache } from "@/lib/cache"

/**
 * GET /api/cache/price-history/[symbol]
 *
 * Returns cached price history for a specific symbol.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const data = await getCachedPriceHistory(symbol.toUpperCase())
    const entry = dataCache.priceHistory.get(symbol.toUpperCase())

    return NextResponse.json({
      data,
      timestamp: entry?.timestamp ?? Date.now(),
      cached: !!entry,
    })
  } catch (error) {
    console.error("[API] Error fetching cached price history:", error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
