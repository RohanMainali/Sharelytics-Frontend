import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()
  if (!symbol || symbol !== "KKHC") {
    return NextResponse.json({ error: "Only KKHC supported in this demo." }, { status: 400 })
  }
  const url = `https://merolagani.com/CompanyDetail.aspx?symbol=kkhc`
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  })
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch chart page" }, { status: 500 })
  }
  const html = await response.text()
  const $ = cheerio.load(html)
  // Find the chart image (canvas or img)
  // Try to find the chart container
  const chartImg = $("img[src*='chart']").first().attr("src")
  // If not found, try to find a canvas screenshot (not possible to scrape canvas directly)
  // So, fallback: scrape the chart container as HTML for client-side rendering
  const chartContainer = $(".company-chart").html() || ""
  return NextResponse.json({ chartImg, chartContainer })
}
