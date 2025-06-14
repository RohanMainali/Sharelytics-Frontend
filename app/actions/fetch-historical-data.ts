"use server"

import * as cheerio from "cheerio"

export interface HistoricalPrice {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchHistoricalData(symbol: string): Promise<HistoricalPrice[]> {
  try {
    // Fetch the company detail page
    const response = await fetch(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Find the price history table
    const priceHistory: HistoricalPrice[] = []

    // The price history table is typically in a tab with ID "ctl00_ContentPlaceHolder1_TabContainer1_tabPriceHistory"
    // or in a table with specific class/structure
    $("table.table-bordered tbody tr").each((index, element) => {
      const tds = $(element).find("td")

      // Skip if not enough columns or header row
      if (tds.length < 6) return

      // Parse date and values
      const dateText = $(tds[0]).text().trim()
      const openText = $(tds[1]).text().trim()
      const highText = $(tds[2]).text().trim()
      const lowText = $(tds[3]).text().trim()
      const closeText = $(tds[4]).text().trim()
      const volumeText = $(tds[5]).text().trim()

      // Skip if any value is not a number
      if (!dateText || !openText || !highText || !lowText || !closeText || !volumeText) return

      // Parse values to numbers
      const open = Number.parseFloat(openText.replace(/,/g, ""))
      const high = Number.parseFloat(highText.replace(/,/g, ""))
      const low = Number.parseFloat(lowText.replace(/,/g, ""))
      const close = Number.parseFloat(closeText.replace(/,/g, ""))
      const volume = Number.parseInt(volumeText.replace(/,/g, ""), 10)

      // Skip if any value is NaN
      if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) return

      priceHistory.push({
        date: dateText,
        open,
        high,
        low,
        close,
        volume,
      })
    })

    return priceHistory
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return []
  }
}
