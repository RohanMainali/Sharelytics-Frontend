"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatNumber, getChangeColor } from "@/lib/utils"
import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SectorTableProps {
  stocks: SharesansarStock[]
  sectorName: string
  onSelectSymbol: (symbol: string) => void
}

export function SectorTable({ stocks, sectorName, onSelectSymbol }: SectorTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SharesansarStock
    direction: "asc" | "desc"
  } | null>(null)

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.company && stock.company.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  if (stocks.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 bg-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">{sectorName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder={`Search in ${sectorName}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-blue-50 border-blue-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400"
          />
          <div className="rounded-md border border-blue-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="w-[80px] text-gray-500">S.No</TableHead>
                  <TableHead className="cursor-pointer text-gray-500" onClick={() => handleSort("symbol")}>Symbol</TableHead>
                  <TableHead className="text-gray-500">Company</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("ltp")}>LTP</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("pointChange")}>Point Change</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("percentChange")}>% Change</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("open")}>Open</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("high")}>High</TableHead>
                  <TableHead className="cursor-pointer text-right text-gray-500" onClick={() => handleSort("low")}>Low</TableHead>
                  <TableHead className="text-right text-gray-500">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStocks.length > 0 ? (
                  sortedStocks.map((stock, index) => (
                    <TableRow
                      key={stock.symbol}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => onSelectSymbol(stock.symbol)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium text-blue-700">{stock.symbol}</TableCell>
                      <TableCell className="text-gray-700">{stock.company || ""}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNumber(stock.ltp)}</TableCell>
                      <TableCell className={`text-right ${getChangeColor(stock.pointChange)}`}>{stock.pointChange}</TableCell>
                      <TableCell className={`text-right ${getChangeColor(stock.percentChange)}`}>{stock.percentChange}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNumber(stock.open)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNumber(stock.high)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNumber(stock.low)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNumber(stock.volume)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-gray-500">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
