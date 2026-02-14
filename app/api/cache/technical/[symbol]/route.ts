import { NextRequest, NextResponse } from "next/server"
import { getCachedTechnicalData, dataCache } from "@/lib/cache"

/**
 * GET /api/cache/technical/[symbol]
 *
 * Returns cached technical analysis data for a specific symbol.
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

    const data = await getCachedTechnicalData(symbol.toUpperCase())
    const entry = dataCache.technicalData.get(symbol.toUpperCase())

    return NextResponse.json({
      data,
      timestamp: entry?.timestamp ?? Date.now(),
      cached: !!entry,
    })
  } catch (error) {
    console.error("[API] Error fetching cached technical data:", error)
    return NextResponse.json({ error: "Failed to fetch technical data" }, { status: 500 })
  }
}
