"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface EmbeddedStockChartProps {
  symbol: string
}

export function EmbeddedStockChart({ symbol }: EmbeddedStockChartProps) {
  const [loading, setLoading] = useState(true)

  // URL to the Merolagani company detail page
  const chartUrl = `https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{symbol} Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height: "500px" }}>
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
          />
        </div>
      </CardContent>
    </Card>
  )
}
