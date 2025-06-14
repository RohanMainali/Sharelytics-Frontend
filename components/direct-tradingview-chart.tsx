"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DirectTradingViewChartProps {
  symbol: string
}

export function DirectTradingViewChart({ symbol }: DirectTradingViewChartProps) {
  const [loading, setLoading] = useState(true)

  // Create a direct URL to TradingView's chart for this symbol
  const chartUrl = `https://www.tradingview.com/chart/?symbol=${symbol}`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{symbol} Price Chart (TradingView)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height: "600px" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={chartUrl}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title={`${symbol} Stock Chart`}
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  )
}
