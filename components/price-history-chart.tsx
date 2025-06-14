"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
  Brush,
} from "recharts"
import { fetchSharehubPriceHistory, type PriceHistoryData } from "@/app/actions/fetch-sharehub-price-history"

interface PriceHistoryChartProps {
  symbol: string
}

export function PriceHistoryChart({ symbol }: PriceHistoryChartProps) {
  const [priceData, setPriceData] = useState<PriceHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1M") // 1W, 1M, 3M, 6M, 1Y, All
  const [chartType, setChartType] = useState("line") // line, area, candle
  const [indicator, setIndicator] = useState("none") // none, sma, ema, rsi, macd

  // Fetch price history data
  useEffect(() => {
    if (!symbol) return

    setLoading(true)

    const fetchData = async () => {
      try {
        const data = await fetchSharehubPriceHistory(symbol)

        // Filter data based on timeframe
        const filteredData = filterDataByTimeframe(data, timeframe)

        // Calculate indicators
        const dataWithIndicators = calculateIndicators(filteredData, indicator)

        setPriceData(dataWithIndicators)
      } catch (error) {
        console.error("Error fetching price history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol, timeframe, indicator])

  // Filter data based on timeframe
  const filterDataByTimeframe = (data: PriceHistoryData[], timeframe: string): PriceHistoryData[] => {
    if (!data.length) return []

    const today = new Date()
    let daysToInclude = 30 // Default to 1 month

    switch (timeframe) {
      case "1W":
        daysToInclude = 7
        break
      case "1M":
        daysToInclude = 30
        break
      case "3M":
        daysToInclude = 90
        break
      case "6M":
        daysToInclude = 180
        break
      case "1Y":
        daysToInclude = 365
        break
      case "All":
        return data
    }

    // Get the cutoff date
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude)

    // Filter data
    return data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= cutoffDate
    })
  }

  // Calculate technical indicators
  const calculateIndicators = (data: PriceHistoryData[], indicator: string): PriceHistoryData[] => {
    if (indicator === "none" || !data.length) return data

    const result = [...data]

    if (indicator === "sma") {
      // Simple Moving Average (20-day)
      const period = 20
      for (let i = period - 1; i < result.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += result[i - j].close
        }
        result[i] = { ...result[i], sma: sum / period }
      }
    } else if (indicator === "ema") {
      // Exponential Moving Average (20-day)
      const period = 20
      const multiplier = 2 / (period + 1)

      // First EMA is SMA
      let sum = 0
      for (let i = 0; i < period && i < result.length; i++) {
        sum += result[i].close
      }

      if (result.length >= period) {
        result[period - 1] = { ...result[period - 1], ema: sum / period }

        // Calculate EMA for the rest
        for (let i = period; i < result.length; i++) {
          const prevEma = result[i - 1].ema || 0
          result[i] = { ...result[i], ema: (result[i].close - prevEma) * multiplier + prevEma }
        }
      }
    } else if (indicator === "rsi") {
      // Relative Strength Index (14-day)
      const period = 14

      if (result.length > period) {
        // Calculate price changes
        for (let i = 1; i < result.length; i++) {
          result[i] = { ...result[i], priceChange: result[i].close - result[i - 1].close }
        }

        // Calculate RSI
        for (let i = period; i < result.length; i++) {
          let gains = 0
          let losses = 0

          for (let j = 0; j < period; j++) {
            const change = result[i - j].priceChange || 0
            if (change > 0) gains += change
            else losses -= change
          }

          const rs = gains / (losses || 1) // Avoid division by zero
          result[i] = { ...result[i], rsi: 100 - 100 / (1 + rs) }
        }
      }
    } else if (indicator === "macd") {
      // MACD (12, 26, 9)
      const shortPeriod = 12
      const longPeriod = 26
      const signalPeriod = 9

      if (result.length > longPeriod + signalPeriod) {
        // Calculate short EMA
        let shortSum = 0
        for (let i = 0; i < shortPeriod; i++) {
          shortSum += result[i].close
        }
        result[shortPeriod - 1] = { ...result[shortPeriod - 1], shortEma: shortSum / shortPeriod }

        for (let i = shortPeriod; i < result.length; i++) {
          const multiplier = 2 / (shortPeriod + 1)
          const prevShortEma = result[i - 1].shortEma || 0
          result[i] = { ...result[i], shortEma: (result[i].close - prevShortEma) * multiplier + prevShortEma }
        }

        // Calculate long EMA
        let longSum = 0
        for (let i = 0; i < longPeriod; i++) {
          longSum += result[i].close
        }
        result[longPeriod - 1] = { ...result[longPeriod - 1], longEma: longSum / longPeriod }

        for (let i = longPeriod; i < result.length; i++) {
          const multiplier = 2 / (longPeriod + 1)
          const prevLongEma = result[i - 1].longEma || 0
          result[i] = { ...result[i], longEma: (result[i].close - prevLongEma) * multiplier + prevLongEma }
        }

        // Calculate MACD line
        for (let i = longPeriod - 1; i < result.length; i++) {
          result[i] = {
            ...result[i],
            macd: (result[i].shortEma || 0) - (result[i].longEma || 0),
          }
        }

        // Calculate signal line
        for (let i = longPeriod + signalPeriod - 2; i < result.length; i++) {
          let sum = 0
          for (let j = 0; j < signalPeriod; j++) {
            sum += result[i - j].macd || 0
          }
          result[i] = { ...result[i], signal: sum / signalPeriod }
        }

        // Calculate histogram
        for (let i = longPeriod + signalPeriod - 2; i < result.length; i++) {
          result[i] = {
            ...result[i],
            histogram: (result[i].macd || 0) - (result[i].signal || 0),
          }
        }
      }
    }

    return result
  }

  const renderPriceChart = () => {
    if (loading) {
      return (
        <div className="w-full h-[300px] flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )
    }

    if (priceData.length === 0) {
      return (
        <div className="w-full h-[300px] flex items-center justify-center border border-dashed rounded-md">
          <div className="text-center p-4">
            <p className="text-muted-foreground">No price history available for {symbol}</p>
            <p className="text-xs text-muted-foreground mt-2">
              This could be due to a connection issue or the data source may be unavailable.
            </p>
          </div>
        </div>
      )
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="close" stroke="#8884d8" name="Price" dot={false} />

            {indicator === "sma" && <Line type="monotone" dataKey="sma" stroke="#82ca9d" name="SMA (20)" dot={false} />}

            {indicator === "ema" && <Line type="monotone" dataKey="ema" stroke="#82ca9d" name="EMA (20)" dot={false} />}

            {indicator === "rsi" && <Line type="monotone" dataKey="rsi" stroke="#ffc658" name="RSI (14)" dot={false} />}

            {indicator === "macd" && (
              <>
                <Line type="monotone" dataKey="macd" stroke="#82ca9d" name="MACD" dot={false} />
                <Line type="monotone" dataKey="signal" stroke="#ffc658" name="Signal" dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="close" stroke="#8884d8" fill="#8884d8" name="Price" />

            {indicator === "sma" && (
              <Area type="monotone" dataKey="sma" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="SMA (20)" />
            )}

            {indicator === "ema" && (
              <Area type="monotone" dataKey="ema" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="EMA (20)" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "candle") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="high" fill="transparent" stroke="#8884d8" name="High" />
            <Bar dataKey="low" fill="transparent" stroke="#82ca9d" name="Low" />
            <Line type="monotone" dataKey="close" stroke="#ff7300" name="Close" dot={false} />
            <Line type="monotone" dataKey="open" stroke="#387908" name="Open" dot={false} />

            {indicator === "sma" && <Line type="monotone" dataKey="sma" stroke="#82ca9d" name="SMA (20)" dot={false} />}

            {indicator === "ema" && <Line type="monotone" dataKey="ema" stroke="#82ca9d" name="EMA (20)" dot={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      )
    }
  }

  const renderVolumeChart = () => {
    if (loading || priceData.length === 0) {
      return null
    }

    return (
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Bar dataKey="volume" fill="#8884d8" name="Volume" />
          <Brush dataKey="date" height={20} stroke="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{symbol} Price Chart</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1W">1W</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="6M">6M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="All">All</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="candle">Candle</SelectItem>
            </SelectContent>
          </Select>

          <Select value={indicator} onValueChange={setIndicator}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Indicator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sma">SMA (20)</SelectItem>
              <SelectItem value="ema">EMA (20)</SelectItem>
              <SelectItem value="rsi">RSI (14)</SelectItem>
              <SelectItem value="macd">MACD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderPriceChart()}
          {renderVolumeChart()}
        </div>
      </CardContent>
    </Card>
  )
}
