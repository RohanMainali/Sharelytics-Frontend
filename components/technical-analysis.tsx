"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/utils"
import { fetchTechnicalData, type TechnicalIndicators } from "@/app/actions/fetch-technical-data"

interface TechnicalAnalysisProps {
  symbol: string | null
  ltp: number | string
  high: string
  low: string
}

export function TechnicalAnalysis({ symbol, ltp, high, low }: TechnicalAnalysisProps) {
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch technical data
  useEffect(() => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const data = await fetchTechnicalData(symbol)
        console.log("Fetched technical data:", data)
        setTechnicalData(data)
      } catch (err) {
        console.error("Error fetching technical data:", err)
        setError("Failed to load technical data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  if (!symbol) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a stock to view technical analysis</p>
        </CardContent>
      </Card>
    )
  }

  // Parse high-low values
  const highLowParts = high.split("-")
  const highValue = Number.parseFloat(highLowParts[0].replace(/,/g, ""))
  const lowValue = Number.parseFloat(highLowParts[1]?.replace(/,/g, "") || "0")

  // Convert LTP to number if it's a string
  const ltpValue = typeof ltp === "number" ? ltp : Number.parseFloat(ltp.toString().replace(/,/g, ""))

  // Calculate support and resistance levels if not available from API
  function calculateSupportResistance() {
    // Simple calculation based on price action
    const range = highValue - lowValue

    return {
      r3: highValue + range * 0.1,
      r2: highValue + range * 0.05,
      r1: highValue,
      pivot: (highValue + lowValue + ltpValue) / 3,
      s1: lowValue,
      s2: lowValue - range * 0.05,
      s3: lowValue - range * 0.1,
    }
  }

  // Use real technical data if available, otherwise use calculated values
  const supportResistance = technicalData?.supportResistance.r1
    ? {
        r3: technicalData.supportResistance.r3,
        r2: technicalData.supportResistance.r2,
        r1: technicalData.supportResistance.r1,
        pivot: technicalData.supportResistance.pivot,
        s1: technicalData.supportResistance.s1,
        s2: technicalData.supportResistance.s2,
        s3: technicalData.supportResistance.s3,
      }
    : calculateSupportResistance()

  // Get RSI value and signal
  const rsi = technicalData?.rsi || { value: 50, signal: "NEUTRAL" }

  // Get MACD signal
  const macdSignal = technicalData?.macd?.signal || "NEUTRAL"

  // Get Moving Average signals
  const ma5 = technicalData?.movingAverages.ma5 || { value: 0, signal: "NEUTRAL" }
  const ma20 = technicalData?.movingAverages.ma20 || { value: 0, signal: "NEUTRAL" }
  const ma180 = technicalData?.movingAverages.ma180 || { value: 0, signal: "NEUTRAL" }

  // Overall signal based on technical indicators
  function getOverallSignal() {
    let bullishCount = 0
    let bearishCount = 0

    // Count bullish/bearish signals
    if (rsi.signal === "BULLISH") bullishCount++
    else if (rsi.signal === "BEARISH") bearishCount++

    if (macdSignal === "BULLISH") bullishCount++
    else if (macdSignal === "BEARISH") bearishCount++

    if (ma5.signal === "BULLISH") bullishCount++
    else if (ma5.signal === "BEARISH") bearishCount++

    if (ma20.signal === "BULLISH") bullishCount++
    else if (ma20.signal === "BEARISH") bearishCount++

    if (ma180.signal === "BULLISH") bullishCount++
    else if (ma180.signal === "BEARISH") bearishCount++

    // Determine overall signal
    if (bullishCount > bearishCount) return "Bullish"
    if (bearishCount > bullishCount) return "Bearish"
    return "Neutral"
  }

  const overallSignal = getOverallSignal()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Analysis - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-red-500">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">Using estimated values based on available price data.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Overall Signal</h3>
                <p className="text-sm text-muted-foreground">Based on technical indicators</p>
              </div>
              <Badge
                className={
                  overallSignal === "Bullish"
                    ? "bg-green-600"
                    : overallSignal === "Bearish"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                }
              >
                {overallSignal}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Support & Resistance</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Resistance 3</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.r3)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Resistance 2</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.r2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Resistance 1</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.r1)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Current Price</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(ltpValue)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Support 1</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.s1)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Support 2</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.s2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Support 3</TableCell>
                      <TableCell className="text-right">{formatNumber(supportResistance.s3)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Technical Indicators</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicator</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Signal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>RSI</TableCell>
                      <TableCell>{rsi.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            rsi.signal === "BULLISH"
                              ? "bg-green-600"
                              : rsi.signal === "BEARISH"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {rsi.signal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MACD</TableCell>
                      <TableCell>{technicalData?.macd?.value.toFixed(2) || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            macdSignal === "BULLISH"
                              ? "bg-green-600"
                              : macdSignal === "BEARISH"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {macdSignal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MA5</TableCell>
                      <TableCell>{ma5.value ? formatNumber(ma5.value) : "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ma5.signal === "BULLISH"
                              ? "bg-green-600"
                              : ma5.signal === "BEARISH"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {ma5.signal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MA20</TableCell>
                      <TableCell>{ma20.value ? formatNumber(ma20.value) : "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ma20.signal === "BULLISH"
                              ? "bg-green-600"
                              : ma20.signal === "BEARISH"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {ma20.signal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MA180</TableCell>
                      <TableCell>{ma180.value ? formatNumber(ma180.value) : "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ma180.signal === "BULLISH"
                              ? "bg-green-600"
                              : ma180.signal === "BEARISH"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                          }
                        >
                          {ma180.signal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Analysis Summary</h3>
              <p className="text-sm">
                {overallSignal === "Bullish" ? (
                  <>
                    The technical indicators for {symbol} are showing a{" "}
                    <span className="font-medium text-green-600">bullish</span> signal. The stock is trading{" "}
                    {ltpValue < supportResistance.s1 ? "below support level" : "above support level"} with RSI at{" "}
                    {rsi.value.toFixed(2)}.{" "}
                    {ma5.value > 0 && ma20.value > 0
                      ? `MA5 (${formatNumber(ma5.value)}) is ${ma5.value > ma20.value ? "above" : "below"} MA20 (${formatNumber(ma20.value)}).`
                      : ""}{" "}
                    Consider watching for entry points near support levels.
                  </>
                ) : overallSignal === "Bearish" ? (
                  <>
                    The technical indicators for {symbol} are showing a{" "}
                    <span className="font-medium text-red-600">bearish</span> signal. The stock is trading{" "}
                    {ltpValue > supportResistance.r1 ? "above resistance level" : "below resistance level"} with RSI at{" "}
                    {rsi.value.toFixed(2)}.{" "}
                    {ma5.value > 0 && ma20.value > 0
                      ? `MA5 (${formatNumber(ma5.value)}) is ${ma5.value > ma20.value ? "above" : "below"} MA20 (${formatNumber(ma20.value)}).`
                      : ""}{" "}
                    Consider caution and watch for potential reversal patterns.
                  </>
                ) : (
                  <>
                    The technical indicators for {symbol} are showing a{" "}
                    <span className="font-medium text-yellow-600">neutral</span> signal. The stock is trading between
                    support and resistance levels with RSI at {rsi.value.toFixed(2)}.{" "}
                    {ma5.value > 0 && ma20.value > 0
                      ? `MA5 (${formatNumber(ma5.value)}) is ${ma5.value > ma20.value ? "above" : "below"} MA20 (${formatNumber(ma20.value)}).`
                      : ""}{" "}
                    Consider waiting for clearer signals before making trading decisions.
                  </>
                )}
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                Technical data sourced from{" "}
                <a
                  href={`https://www.sharesansar.com/company/${symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  ShareSansar
                </a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
