"use server"

import { cache } from "react"

export interface PriceHistoryData {
  date: string
  change: number
  changePercent: number
  close: number
  turnover: string
  volume: number
  trades: number
  open: number
  high: number
  low: number
}

export interface SharehubPriceHistory {
  symbol: string
  id: number
  averageTradedPrice: number
  transactions: number
  turnover: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  changePercent: number
  change: number
}

export const fetchSharehubPriceHistory = cache(async (symbol: string): Promise<SharehubPriceHistory[]> => {
  const pageSize = 10
  let allData: SharehubPriceHistory[] = []
  let totalPages = 1

  // Fetch first page to get totalPages
  const firstUrl = `https://sharehubnepal.com/data/api/v1/price-history?pageSize=${pageSize}&symbol=${symbol}&page=1`
  const firstRes = await fetch(firstUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
    cache: "no-store",
  })
  if (!firstRes.ok) throw new Error("Failed to fetch first page")
  const firstJson = await firstRes.json()
  totalPages = firstJson.data.totalPages
  allData = firstJson.data.content

  // Fetch remaining pages in parallel (but not too many at once)
  const pagePromises: Promise<Response>[] = []
  for (let page = 2; page <= totalPages; page++) {
    const url = `https://sharehubnepal.com/data/api/v1/price-history?pageSize=${pageSize}&symbol=${symbol}&page=${page}`
    pagePromises.push(
      fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        cache: "no-store",
      })
    )
  }
  const results = await Promise.all(pagePromises)
  for (const res of results) {
    if (res.ok) {
      const json = await res.json()
      allData = allData.concat(json.data.content)
    }
  }
  return allData
})
