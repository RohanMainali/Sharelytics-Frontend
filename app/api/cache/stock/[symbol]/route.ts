import { NextRequest, NextResponse } from "next/server"
import { getCachedMerolaganiDetail, dataCache } from "@/lib/cache"

/**
 * GET /api/cache/stock/[symbol]
 *
 * Returns cached merolagani detail for a specific symbol.
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

    const data = await getCachedMerolaganiDetail(symbol.toUpperCase())
    const entry = dataCache.merolaganiDetails.get(symbol.toUpperCase())

    return NextResponse.json({
      data,
      timestamp: entry?.timestamp ?? Date.now(),
      cached: !!entry,
    })
  } catch (error) {
    console.error("[API] Error fetching cached stock detail:", error)
    return NextResponse.json({ error: "Failed to fetch stock detail" }, { status: 500 })
  }
}
