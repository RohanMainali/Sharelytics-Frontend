"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { type MerolaganiStock, fetchMultipleMerolaganiData } from "@/app/actions/fetch-merolagani-data"
import { formatNumber, getChangeColor } from "@/lib/utils"
import { debounce } from "lodash-es"
import { fetchSharesansarData } from "@/app/actions/fetch-sharesansar-data"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"

interface WatchlistProps {
  onSelectSymbol: (symbol: string) => void
}

export function Watchlist({ onSelectSymbol }: WatchlistProps) {
  const [symbols, setSymbols] = useState<string[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [stockData, setStockData] = useState<MerolaganiStock[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch watchlist from backend on mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/watchlist`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setSymbols(data.watchlist || [])
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchWatchlist()
  }, [])

  // Update backend when symbols change
  useEffect(() => {
    const updateWatchlist = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        await fetch(`${BACKEND_URL}/api/user/watchlist`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ watchlist: symbols })
        })
      } catch (err) {}
    }
    if (symbols.length > 0) updateWatchlist()
  }, [symbols])

  // Fetch data for watchlist symbols
  useEffect(() => {
    if (symbols.length === 0) {
      setStockData([])
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchMultipleMerolaganiData(symbols)
        setStockData(data)
      } catch (error) {
        console.error("Error fetching watchlist data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchData, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [symbols])

  // Debounced fetch for suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const stocks = await fetchSharesansarData()
      const matches = stocks.filter(
        s => s.symbol.toLowerCase().includes(query.toLowerCase()) ||
             s.company.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
      setSuggestions(matches)
      setShowSuggestions(true)
    } catch {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, 200)

  useEffect(() => {
    fetchSuggestions(newSymbol)
    return () => fetchSuggestions.cancel()
  }, [newSymbol])

  const addSymbol = () => {
    if (newSymbol && !symbols.includes(newSymbol.toUpperCase())) {
      setSymbols([...symbols, newSymbol.toUpperCase()])
      setNewSymbol("")
    }
  }

  const removeSymbol = (symbolToRemove: string) => {
    setSymbols(symbols.filter((s) => s !== symbolToRemove))
  }

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 relative">
          <Input
            placeholder="Add symbol (e.g., NABIL)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSymbol()
            }}
            className="bg-blue-50 border-blue-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 rounded-lg px-4 py-3 text-base shadow-sm"
          />
          <Button onClick={addSymbol} size="icon" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm">
            <Plus className="h-5 w-5" />
          </Button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-14 bg-white rounded-xl shadow-xl z-50 border border-blue-200 max-h-72 overflow-y-auto">
              {suggestions.map((s, i) => (
                <div
                  key={s.symbol}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center gap-2 rounded-lg"
                  onMouseDown={() => {
                    setShowSuggestions(false)
                    setNewSymbol("")
                    setSymbols([...symbols, s.symbol.toUpperCase()])
                  }}
                >
                  <span className="font-semibold text-blue-700 text-base">{s.symbol}</span>
                  <span className="text-gray-500 text-xs">{s.company}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {loading && symbols.length > 0 && stockData.length === 0 ? (
          <p className="text-sm text-gray-400">Loading watchlist...</p>
        ) : (
          <div className="space-y-4">
            {stockData.map((stock) => (
              <div
                key={stock.symbol}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-blue-100 rounded-xl bg-blue-50/40 hover:bg-blue-100/60 transition cursor-pointer shadow-sm"
                onClick={() => onSelectSymbol(stock.symbol)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-blue-700 text-lg leading-tight truncate">{stock.symbol}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                    <span>EPS: <span className="font-medium text-gray-700">{stock.eps}</span></span>
                    <span>P/E: <span className="font-medium text-gray-700">{stock.peRatio}</span></span>
                    <span>Book Value: <span className="font-medium text-gray-700">{stock.bookValue}</span></span>
                    <span>PBV: <span className="font-medium text-gray-700">{stock.pbv}</span></span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[80px]">
                  <div className="font-bold text-xl text-gray-900">
                    {typeof stock.ltp === "number" ? formatNumber(stock.ltp) : stock.ltp}
                  </div>
                  <div className={`text-base font-medium ${getChangeColor(stock.percentChange)}`}>{stock.percentChange}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 ml-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSymbol(stock.symbol)
                  }}
                  aria-label={`Remove ${stock.symbol}`}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
            {symbols.length === 0 && (
              <p className="text-sm text-gray-400">Add symbols to your watchlist to track them here.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
