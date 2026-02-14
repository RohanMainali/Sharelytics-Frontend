import { NextResponse } from "next/server"
import {
  getCachedNews,
  startHeartbeat,
  isHeartbeatRunning,
  dataCache,
} from "@/lib/cache"

/**
 * GET /api/cache/news
 *
 * Returns cached market news.
 */
export async function GET() {
  try {
    if (!isHeartbeatRunning()) {
      startHeartbeat()
    }

    const news = await getCachedNews()

    return NextResponse.json({
      news,
      timestamp: dataCache.news?.timestamp ?? Date.now(),
      count: news.length,
    })
  } catch (error) {
    console.error("[API] Error fetching cached news:", error)
    return NextResponse.json({ error: "Failed to fetch news", news: [] }, { status: 500 })
  }
}
