"use server"

import * as cheerio from "cheerio"
import { getSectorForSymbol } from "@/lib/sectors"

export type SharesansarStock = {
  sNo: string
  symbol: string
  company: string
  ltp: string
  pointChange: string
  percentChange: string
  open: string
  high: string
  low: string
  volume: string
  prevClose: string
  sector: string
}

export async function fetchSharesansarData(): Promise<SharesansarStock[]> {
  try {
    const response = await fetch("https://www.sharesansar.com/live-trading", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const stocks: SharesansarStock[] = []

    // Find the first table on the page
    const table = $("table").first()

    // Process each row in the table body
    table.find("tbody tr").each((index, element) => {
      const tds = $(element).find("td")

      const symbol = $(tds[1]).text().trim()
      const companyName = $(tds[1]).attr("title") || symbol

      const stock: SharesansarStock = {
        sNo: $(tds[0]).text().trim(),
        symbol,
        company: companyName,
        ltp: $(tds[2]).text().trim(),
        pointChange: $(tds[3]).text().trim(),
        percentChange: $(tds[4]).text().trim(),
        open: $(tds[5]).text().trim(),
        high: $(tds[6]).text().trim(),
        low: $(tds[7]).text().trim(),
        volume: $(tds[8]).text().trim(),
        prevClose: $(tds[9]).text().trim(),
        sector: getSectorForSymbol(symbol),
      }

      stocks.push(stock)
    })

    return stocks
  } catch (error) {
    console.error("Error fetching sharesansar data:", error)
    return []
  }
}
