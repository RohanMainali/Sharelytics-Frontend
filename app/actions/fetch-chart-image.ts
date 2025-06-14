"use server"

import * as cheerio from "cheerio"

export async function fetchChartImage(symbol: string): Promise<string | null> {
  try {
    // Fetch the Merolagani page
    const response = await fetch(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page for ${symbol}: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Try to find the chart iframe
    const chartIframe = $("#tv_chart_container iframe")

    if (chartIframe.length > 0) {
      const iframeSrc = chartIframe.attr("src")
      console.log("Found chart iframe with src:", iframeSrc)
      return iframeSrc || null
    }

    console.log("Chart iframe not found")
    return null
  } catch (error) {
    console.error(`Error fetching chart image for ${symbol}:`, error)
    return null
  }
}
