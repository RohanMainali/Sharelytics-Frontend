"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatNumber, getChangeColor } from "@/lib/utils"
import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"

interface StockTableProps {
  stocks: SharesansarStock[]
  onSelectSymbol: (symbol: string) => void
}

export function StockTable({ stocks, onSelectSymbol }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SharesansarStock
    direction: "asc" | "desc"
  } | null>(null)

  // Filter stocks based on search term
  const filteredStocks = stocks.filter((stock) => stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))

  // Sort stocks based on sort config
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig
    const aValue = a[key]
    const bValue = b[key]

    // Handle numeric sorting for appropriate columns
    if (["ltp", "pointChange", "percentChange", "open", "high", "low", "volume"].includes(key)) {
      const aNum = Number.parseFloat(String(aValue).replace(/[,%]/g, ""))
      const bNum = Number.parseFloat(String(bValue).replace(/[,%]/g, ""))

      if (isNaN(aNum) || isNaN(bNum)) return 0

      return direction === "asc" ? aNum - bNum : bNum - aNum
    }

    // Default string sorting
    return direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const handleSort = (key: keyof SharesansarStock) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by symbol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("sNo")}>
                S.No
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("symbol")}>
                Symbol
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("ltp")}>
                LTP
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("pointChange")}>
                Point Change
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("percentChange")}>
                % Change
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("open")}>
                Open
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("high")}>
                High
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("low")}>
                Low
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("volume")}>
                Volume
              </TableHead>
              <TableHead className="text-right">Prev. Close</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStocks.length > 0 ? (
              sortedStocks.map((stock) => (
                <TableRow
                  key={stock.symbol}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => onSelectSymbol(stock.symbol)}
                >
                  <TableCell>{stock.sNo}</TableCell>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.ltp)}</TableCell>
                  <TableCell className={`text-right ${getChangeColor(stock.pointChange)}`}>
                    {stock.pointChange}
                  </TableCell>
                  <TableCell className={`text-right ${getChangeColor(stock.percentChange)}`}>
                    {stock.percentChange}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(stock.open)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.high)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.low)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.volume)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.prevClose)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
