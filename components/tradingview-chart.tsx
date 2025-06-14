"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Add TradingView types
declare global {
  interface Window {
    TradingView: any
  }
}

interface TradingViewChartProps {
  symbol: string
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create the script element for TradingView widget
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    script.type = "text/javascript"

    // Configure the widget
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol, // Use the symbol directly as Merolagani does
      interval: "D",
      timezone: "Asia/Kathmandu",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_side_toolbar: false,
      withdateranges: true,
      save_image: true,
      container_id: container.current?.id,
    })

    // Add the script to the container
    if (container.current) {
      container.current.appendChild(script)
    }

    // Set loading to false after a reasonable time
    const timer = setTimeout(() => setLoading(false), 2000)

    return () => {
      // Clean up
      if (container.current && script.parentNode === container.current) {
        container.current.removeChild(script)
      }
      clearTimeout(timer)
    }
  }, [symbol])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{symbol} Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="w-full h-[500px]" />}
        <div
          id={`tradingview_${symbol.toLowerCase()}`}
          ref={container}
          className="w-full"
          style={{ height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}
