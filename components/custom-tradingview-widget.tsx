"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface CustomTradingViewWidgetProps {
  symbol: string
}

export function CustomTradingViewWidget({ symbol }: CustomTradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const container = document.createElement("div")
    container.setAttribute("class", "tradingview-widget-container")

    const widget = document.createElement("div")
    widget.setAttribute("class", "tradingview-widget-container__widget")
    container.appendChild(widget)

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://s3.tradingview.com/tv.js"

    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          width: "100%",
          height: 500,
          symbol: symbol,
          interval: "D",
          timezone: "Asia/Kathmandu",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: true,
          container_id: containerRef.current.id,
        })
        setLoading(false)
      }
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(container)
      document.head.appendChild(script)
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
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
          id={`tv-chart-${symbol.toLowerCase()}`}
          ref={containerRef}
          className="w-full"
          style={{ height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}
