import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: "No symbol" }, { status: 400 })
  const url = `https://merolagani.com/Handlers/ChartHandler.ashx?companySymbol=${symbol}`
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  })
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  const data = await res.json()
  return NextResponse.json({ data })
}
