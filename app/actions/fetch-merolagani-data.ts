"use server"

import * as cheerio from "cheerio"

export type MerolaganiStock = {
  symbol: string
  ltp: number | string
  highLow: string
  eps: string | number
  peRatio: string | number
  bookValue: string | number
  pbv: string | number
  percentChange: string | number
  company: string
  listedShares: string | number
  paidUpCapital: string | number
  marketCapitalization: string | number
  dividendHistory: Array<{ year: string; cash: string; bonus: string }>
  quarterlyEarnings: Array<{ quarter: string; eps: string }>
  sectorPE: number | string
}

export async function fetchMerolaganiData(symbol: string): Promise<MerolaganiStock> {
  try {
    const url = `https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`
    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract company name
    const companyName = $("h4.panel-title").text().trim()

    // Extract Market Price (LTP)
    const ltpElement = $("#ctl00_ContentPlaceHolder1_CompanyDetail1_lblMarketPrice")
    const ltp = ltpElement.length ? Number.parseFloat(ltpElement.text().replace(/,/g, "")) : "N/A"

    // Extract 52 Weeks High - Low
    const highLowElement = $('th:contains("52 Weeks High - Low")').next("td")
    const highLow = highLowElement.length ? highLowElement.text().trim() : "N/A"

    // Extract EPS
    const epsElement = $('th:contains("EPS")').next("td")
    let eps = "N/A"

    if (epsElement.length) {
      const epsText = epsElement.text().trim()
      const epsMatch = epsText.match(/([\d.,-]+)/)
      const epsValue = epsMatch ? Number.parseFloat(epsMatch[1].replace(/,/g, "")) : Number.NaN
      const epsSpan = epsElement.find("span").text().trim()

      eps = epsSpan ? `${epsValue} ${epsSpan}` : epsValue
    }

    // Extract P/E Ratio
    const peRatioElement = $('th:contains("P/E Ratio")').next("td")
    const peRatio = peRatioElement.length ? peRatioElement.text().trim() : "N/A"

    // Extract Book Value
    const bookValueElement = $('th:contains("Book Value")').next("td")
    const bookValue = bookValueElement.length ? bookValueElement.text().trim() : "N/A"

    // Extract PBV
    const pbvElement = $('th:contains("PBV")').next("td")
    const pbv = pbvElement.length ? pbvElement.text().trim() : "N/A"

    // Extract % Change
    const percentChangeElement = $("#ctl00_ContentPlaceHolder1_CompanyDetail1_lblChange")
    const percentChange = percentChangeElement.length ? percentChangeElement.text().trim() : "N/A"

    // Extract Listed Shares
    const listedSharesElement = $('th:contains("Listed Shares")').next("td")
    const listedShares = listedSharesElement.length ? listedSharesElement.text().trim() : "N/A"

    // Extract Paid Up Capital - Fix the parsing issue
    const paidUpCapitalElement = $('th:contains("Paid Up Capital")').next("td")
    let paidUpCapital = "N/A"
    if (paidUpCapitalElement.length) {
      // Remove any non-numeric characters except commas, dots, and minus signs
      const paidUpText = paidUpCapitalElement.text().trim()
      const numericValue = paidUpText.replace(/[^\d,.]/g, "")
      paidUpCapital = numericValue || "N/A"
    }

    // Extract Market Capitalization
    const marketCapElement = $('th:contains("Market Capitalization")').next("td")
    const marketCapitalization = marketCapElement.length ? marketCapElement.text().trim() : "N/A"

    // Extract dividend history if available
    const dividendHistory: Array<{ year: string; cash: string; bonus: string }> = []
    $('table.table:contains("Dividend History")')
      .find("tbody tr")
      .each((i, row) => {
        const columns = $(row).find("td")
        if (columns.length >= 3) {
          dividendHistory.push({
            year: $(columns[0]).text().trim(),
            cash: $(columns[1]).text().trim(),
            bonus: $(columns[2]).text().trim(),
          })
        }
      })

    // Extract quarterly earnings if available
    const quarterlyEarnings: Array<{ quarter: string; eps: string }> = []
    $('table.table:contains("Quarterly EPS")')
      .find("tbody tr")
      .each((i, row) => {
        const columns = $(row).find("td")
        if (columns.length >= 2) {
          quarterlyEarnings.push({
            quarter: $(columns[0]).text().trim(),
            eps: $(columns[1]).text().trim(),
          })
        }
      })

    // Try to extract sector average P/E if available
    let sectorPE = "N/A"
    const sectorPEElement = $('th:contains("Sector P/E")').next("td")
    if (sectorPEElement.length) {
      sectorPE = sectorPEElement.text().trim()
    }

    return {
      symbol,
      company: companyName,
      ltp,
      highLow,
      eps,
      peRatio,
      bookValue,
      pbv,
      percentChange,
      listedShares,
      paidUpCapital,
      marketCapitalization,
      dividendHistory,
      quarterlyEarnings,
      sectorPE,
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return {
      symbol,
      company: symbol,
      ltp: "Error",
      highLow: "Error",
      eps: "Error",
      peRatio: "Error",
      bookValue: "Error",
      pbv: "Error",
      percentChange: "Error",
      listedShares: "Error",
      paidUpCapital: "Error",
      marketCapitalization: "Error",
      dividendHistory: [],
      quarterlyEarnings: [],
      sectorPE: "Error",
    }
  }
}

export async function fetchMultipleMerolaganiData(symbols: string[]): Promise<MerolaganiStock[]> {
  const promises = symbols.map((symbol) => fetchMerolaganiData(symbol))
  return Promise.all(promises)
}
