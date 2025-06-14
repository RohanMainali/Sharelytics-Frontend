"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface MerolaganiChartProps {
  symbol: string
}

export function MerolaganiChart({ symbol }: MerolaganiChartProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (symbol.toUpperCase() !== "KKHC") return
    setLoading(true)
    fetch(`/api/merolagani-chart?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => {
        setImgUrl(data.chartImg || null)
        setHtmlContent(data.chartContainer || null)
        setError(null)
      })
      .catch(() => setError("Failed to load chart"))
      .finally(() => setLoading(false))
  }, [symbol])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {symbol.toUpperCase() !== "KKHC" ? null : loading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : error ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        ) : imgUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            <img
              src={imgUrl.startsWith("http") ? imgUrl : `https://merolagani.com${imgUrl}`}
              alt="Price History Chart"
              className="rounded-lg border shadow max-w-full"
            />
            <div className="text-xs text-gray-500 mt-2">Source: merolagani.com</div>
          </div>
        ) : htmlContent ? (
          <div
            className="bg-white rounded-lg border shadow p-4 my-4"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">No chart found.</div>
        )}
      </CardContent>
    </Card>
  )
}

export function MerolaganiPriceHistoryChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/merolagani-price-history?symbol=${symbol}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setData(res.data)
          setError(null)
        } else {
          setError(res.error || "No data")
        }
      })
      .catch(() => setError("Failed to load chart data"))
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) return <div className="text-center text-gray-500 py-8">Loading price history...</div>
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>
  if (!data.length) return <div className="text-center text-gray-500 py-8">No price history data.</div>

  return (
    <div className="bg-white rounded-lg border shadow p-4 my-4">
      <h3 className="font-semibold mb-2 text-gray-800">Price History (merolagani.com)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="Close" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
