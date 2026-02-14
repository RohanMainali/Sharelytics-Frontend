"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type MerolaganiStock } from "@/app/actions/fetch-merolagani-data"
import { fetchCachedStockDetail } from "@/lib/cache-client"
import { formatNumber, getChangeColor } from "@/lib/utils"
import { StockChart } from "@/components/stock-chart"
import { FundamentalAnalysis } from "@/components/fundamental-analysis"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { PriceHistoryChart } from "@/components/price-history-chart"

interface StockDetailProps {
  symbol: string | null
}

export function StockDetail({ symbol }: StockDetailProps) {
  const [stockData, setStockData] = useState<MerolaganiStock | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!symbol) {
      setStockData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await fetchCachedStockDetail(symbol)
        setStockData(data)
      } catch (error) {
        console.error("Error fetching stock details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Poll from cache every 30s (cache is refreshed by server heartbeat)
    const intervalId = setInterval(fetchData, 30000)

    return () => clearInterval(intervalId)
  }, [symbol])

  if (!symbol) {
    return (
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Stock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Select a stock to view details</p>
        </CardContent>
      </Card>
    )
  }

  if (loading && !stockData) {
    return (
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Loading {symbol} Details...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full bg-blue-100" />
          <Skeleton className="h-6 w-full bg-blue-100" />
          <Skeleton className="h-6 w-full bg-blue-100" />
          <Skeleton className="h-6 w-full bg-blue-100" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-gray-900">{stockData?.company || symbol}</CardTitle>
              <p className="text-sm text-gray-500">{symbol}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {typeof stockData?.ltp === "number" ? formatNumber(stockData.ltp) : stockData?.ltp}
              </div>
              <div className={`text-sm ${getChangeColor(stockData?.percentChange || 0)}`}>{stockData?.percentChange}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">52W High-Low</p>
              <p className="text-gray-900">{stockData?.highLow}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">EPS</p>
              <p className="text-gray-900">{stockData?.eps}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">P/E Ratio</p>
              <p className="text-gray-900">{stockData?.peRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Book Value</p>
              <p className="text-gray-900">{stockData?.bookValue}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chart">
        <TabsList className="mb-4 bg-blue-50">
          <TabsTrigger value="chart" className="data-[state=active]:bg-blue-100">Price Chart</TabsTrigger>
          <TabsTrigger value="fundamental" className="data-[state=active]:bg-blue-100">Fundamental</TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-blue-100">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          {symbol && <PriceHistoryChart symbol={symbol} />}
        </TabsContent>

        <TabsContent value="fundamental">
          <FundamentalAnalysis stockData={stockData} loading={loading} />
        </TabsContent>

        <TabsContent value="technical">
          <TechnicalAnalysis symbol={symbol} ltp={stockData?.ltp || 0} high={stockData?.highLow?.split("-")[0]?.trim() || "0"} low={stockData?.highLow?.split("-")[1]?.trim() || "0"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
