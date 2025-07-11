"use server"

import * as cheerio from "cheerio"

export interface TechnicalIndicators {
  movingAverages: {
    ma5: { value: number; signal: string }
    ma20: { value: number; signal: string }
    ma180: { value: number; signal: string }
  }
  rsi: { value: number; signal: string }
  macd: { value: number; signal: string }
  supportResistance: {
    s1: number
    s2: number
    s3: number
    r1: number
    r2: number
    r3: number
    pivot: number
  }
  oscillators?: Array<{ name: string; value: number; action: string }>
}

export async function fetchTechnicalData(symbol: string): Promise<TechnicalIndicators | null> {
  try {
    // Fetch the technical analysis page from sharesansar
    const response = await fetch(`https://www.sharesansar.com/company/${symbol}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch technical data for ${symbol}: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Initialize with default values
    const technicalData: TechnicalIndicators = {
      movingAverages: {
        ma5: { value: 0, signal: "NEUTRAL" },
        ma20: { value: 0, signal: "NEUTRAL" },
        ma180: { value: 0, signal: "NEUTRAL" },
      },
      rsi: { value: 50, signal: "NEUTRAL" },
      macd: { value: 0, signal: "NEUTRAL" },
      supportResistance: {
        s1: 0,
        s2: 0,
        s3: 0,
        r1: 0,
        r2: 0,
        r3: 0,
        pivot: 0,
      },
      oscillators: [],
    }

    // Extract Moving Averages
    // First, try to find the Moving Analysis section
    const movingAnalysisTable = $('h4:contains("Moving Analysis")').closest(".panel").find("table")

    if (movingAnalysisTable.length > 0) {
      movingAnalysisTable.find("tr").each((i, row) => {
        const cells = $(row).find("td")
        if (cells.length >= 3) {
          const indicator = $(cells[0]).text().trim()
          const valueText = $(cells[1]).text().trim()
          const value = Number.parseFloat(valueText.replace(/,/g, ""))
          const signal = $(cells[2]).text().trim()

          if (indicator === "MA5" && !isNaN(value)) {
            technicalData.movingAverages.ma5 = { value, signal }
          } else if (indicator === "MA20" && !isNaN(value)) {
            technicalData.movingAverages.ma20 = { value, signal }
          } else if (indicator === "MA180" && !isNaN(value)) {
            technicalData.movingAverages.ma180 = { value, signal }
          }
        }
      })
    } else {
      // If we can't find the specific section, try a more general approach
      $("table tbody tr").each((i, row) => {
        const cells = $(row).find("td")
        if (cells.length >= 2) {
          const indicator = $(cells[0]).text().trim()

          if (indicator === "MA5" || indicator === "MA20" || indicator === "MA180") {
            const valueText = $(cells[1]).text().trim()
            const value = Number.parseFloat(valueText.replace(/,/g, ""))
            const signal = cells.length >= 3 ? $(cells[2]).text().trim() : "NEUTRAL"

            if (!isNaN(value)) {
              if (indicator === "MA5") {
                technicalData.movingAverages.ma5 = { value, signal }
              } else if (indicator === "MA20") {
                technicalData.movingAverages.ma20 = { value, signal }
              } else if (indicator === "MA180") {
                technicalData.movingAverages.ma180 = { value, signal }
              }
            }
          }
        }
      })
    }

    // Extract RSI - try multiple approaches
    let rsiFound = false

    // First approach: Look for RSI in a table row
    $("table tbody tr").each((i, row) => {
      const cells = $(row).find("td")
      if (cells.length >= 2) {
        const indicator = $(cells[0]).text().trim()

        if (indicator === "RSI" || indicator.includes("RSI")) {
          const valueText = $(cells[1]).text().trim()
          const value = Number.parseFloat(valueText.replace(/,/g, ""))
          const signal = cells.length >= 3 ? $(cells[2]).text().trim() : "NEUTRAL"

          if (!isNaN(value)) {
            technicalData.rsi = { value, signal }
            rsiFound = true
          }
        }
      }
    })

    // Second approach: Look for RSI in any element
    if (!rsiFound) {
      $("*:contains('RSI')").each((i, el) => {
        const text = $(el).text()
        const rsiMatch = text.match(/RSI[:\s]+(\d+\.?\d*)/)

        if (rsiMatch && rsiMatch[1]) {
          const value = Number.parseFloat(rsiMatch[1])
          if (!isNaN(value)) {
            // Determine signal based on RSI value
            let signal = "NEUTRAL"
            if (value > 70) signal = "BEARISH"
            else if (value < 30) signal = "BULLISH"

            technicalData.rsi = { value, signal }
            rsiFound = true
          }
        }
      })
    }

    // Extract MACD - similar approach as RSI
    let macdFound = false

    $("table tbody tr").each((i, row) => {
      const cells = $(row).find("td")
      if (cells.length >= 2) {
        const indicator = $(cells[0]).text().trim()

        if (indicator === "MACD" || indicator.includes("MACD")) {
          const valueText = $(cells[1]).text().trim()
          const value = Number.parseFloat(valueText.replace(/,/g, ""))
          const signal = cells.length >= 3 ? $(cells[2]).text().trim() : "NEUTRAL"

          if (!isNaN(value)) {
            technicalData.macd = { value, signal }
            macdFound = true
          }
        }
      }
    })

    if (!macdFound) {
      $("*:contains('MACD')").each((i, el) => {
        const text = $(el).text()
        const macdMatch = text.match(/MACD[:\s]+(\d+\.?\d*)/)

        if (macdMatch && macdMatch[1]) {
          const value = Number.parseFloat(macdMatch[1])
          if (!isNaN(value)) {
            // Determine signal based on MACD value
            const signal = value > 0 ? "BULLISH" : "BEARISH"
            technicalData.macd = { value, signal }
            macdFound = true
          }
        }
      })
    }

    // Fetch technicals from ShareHubNepal API (preferred over scraping)
    try {
      const apiRes = await fetch(`https://sharehubnepal.com/data/api/v1/technical-analysis/technical-ratings/${symbol.toUpperCase()}`)
      if (apiRes.ok) {
        const apiJson = await apiRes.json()
        // MACD, RSI, and all oscillators from oscillatorRating
        if (apiJson?.data?.oscillatorRating?.ratings) {
          technicalData.oscillators = apiJson.data.oscillatorRating.ratings.map((item: any) => ({
            name: item.name,
            value: item.value,
            action: item.action
          }))
          // For backward compatibility, still set macd/rsi if present
          for (const item of apiJson.data.oscillatorRating.ratings) {
            if (item.name && item.name.toUpperCase().includes("MACD")) {
              technicalData.macd.value = item.value
              technicalData.macd.signal = item.action?.toUpperCase() || technicalData.macd.signal
            }
            if (item.name && item.name.toUpperCase().includes("RSI")) {
              technicalData.rsi.value = item.value
              technicalData.rsi.signal = item.action?.toUpperCase() || technicalData.rsi.signal
            }
          }
        }
      }
    } catch (err) {
      // fallback to scraping if needed
    }

    // Fetch the technical analysis page from sharehubnepal
    const sharehubRes = await fetch(`https://sharehubnepal.com/company/${symbol}/technical-analysis`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    })
    if (sharehubRes.ok) {
      const sharehubHtml = await sharehubRes.text()
      const $sharehub = cheerio.load(sharehubHtml)
      // Search all tables for MACD and RSI rows (case-insensitive, partial match)
      $sharehub('table').each((i, table) => {
        $sharehub(table).find('tr').each((j, row) => {
          const cells = $sharehub(row).find('td')
          if (cells.length >= 3) {
            const label = $sharehub(cells[0]).text().trim().toUpperCase()
            const valueText = $sharehub(cells[1]).text().trim()
            const value = Number.parseFloat(valueText.replace(/,/g, ""))
            const signalDiv = $sharehub(cells[2]).find('div').first()
            const signal = signalDiv.length ? signalDiv.text().trim().toUpperCase() : $sharehub(cells[2]).text().trim().toUpperCase()
            if (label.includes("MACD")) {
              if (!isNaN(value)) technicalData.macd.value = value
              technicalData.macd.signal = signal || technicalData.macd.signal
            }
            if (label.includes("RSI")) {
              if (!isNaN(value)) technicalData.rsi.value = value
              technicalData.rsi.signal = signal || technicalData.rsi.signal
            }
          }
        })
      })
    }

    // Extract Support and Resistance
    // Try to find the Support & Resistance section
    const srTable = $('h4:contains("Support & Resistance")').closest(".panel").find("table")

    if (srTable.length > 0) {
      srTable.find("tr").each((i, row) => {
        const cells = $(row).find("td")
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim()
          const valueText = $(cells[1]).text().trim()
          const value = Number.parseFloat(valueText.replace(/,/g, ""))

          if (!isNaN(value)) {
            if (label.includes("S1")) technicalData.supportResistance.s1 = value
            else if (label.includes("S2")) technicalData.supportResistance.s2 = value
            else if (label.includes("S3")) technicalData.supportResistance.s3 = value
            else if (label.includes("R1")) technicalData.supportResistance.r1 = value
            else if (label.includes("R2")) technicalData.supportResistance.r2 = value
            else if (label.includes("R3")) technicalData.supportResistance.r3 = value
            else if (label.includes("Pivot")) technicalData.supportResistance.pivot = value
          }
        }
      })
    } else {
      // If we can't find the specific section, try a more general approach
      $("table tbody tr").each((i, row) => {
        const cells = $(row).find("td")
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim()
          const valueText = $(cells[1]).text().trim()
          const value = Number.parseFloat(valueText.replace(/,/g, ""))

          if (!isNaN(value)) {
            if (label.includes("S1")) technicalData.supportResistance.s1 = value
            else if (label.includes("S2")) technicalData.supportResistance.s2 = value
            else if (label.includes("S3")) technicalData.supportResistance.s3 = value
            else if (label.includes("R1")) technicalData.supportResistance.r1 = value
            else if (label.includes("R2")) technicalData.supportResistance.r2 = value
            else if (label.includes("R3")) technicalData.supportResistance.r3 = value
            else if (label.includes("Pivot")) technicalData.supportResistance.pivot = value
          }
        }
      })
    }

    // Log the extracted data for debugging
    console.log("Extracted technical data:", JSON.stringify(technicalData, null, 2))

    return technicalData
  } catch (error) {
    console.error(`Error fetching technical data for ${symbol}:`, error)
    return null
  }
}
