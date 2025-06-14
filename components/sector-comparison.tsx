"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { formatNumber, getChangeColor } from "@/lib/utils"
import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"
import type { SectorType } from "@/lib/sectors"

interface SectorComparisonProps {
  stocks: SharesansarStock[]
}

export function SectorComparison({ stocks }: SectorComparisonProps) {
  const [selectedSector, setSelectedSector] = useState<SectorType>("Commercial Banks")
  const [sectorStocks, setSectorStocks] = useState<SharesansarStock[]>([])
  const [sectorPerformance, setSectorPerformance] = useState<any[]>([])

  const sectors: SectorType[] = [
    "Commercial Banks",
    "Development Banks",
    "Finance",
    "Life Insurance",
    "Non Life Insurance",
    "Hydropower",
    "Manufacturing and Processing",
    "Microfinance",
    "Investment",
    "Hotel and Tourism",
    "Trading",
  ]

  useEffect(() => {
    // Filter stocks by selected sector
    const filteredStocks = stocks.filter((stock) => stock.sector === selectedSector)
    setSectorStocks(filteredStocks)

    // Calculate sector performance data
    const sectorData = sectors
      .map((sector) => {
        const sectorStocks = stocks.filter((stock) => stock.sector === sector)

        if (sectorStocks.length === 0) {
          return {
            name: sector,
            avgChange: 0,
            stockCount: 0,
          }
        }

        // Calculate average change percentage
        const totalChange = sectorStocks.reduce((sum, stock) => {
          const change = Number.parseFloat(stock.percentChange.toString().replace(/[+%]/g, ""))
          return isNaN(change) ? sum : sum + change
        }, 0)

        return {
          name: sector,
          avgChange: sectorStocks.length > 0 ? totalChange / sectorStocks.length : 0,
          stockCount: sectorStocks.length,
        }
      })
      .sort((a, b) => b.avgChange - a.avgChange)

    setSectorPerformance(sectorData)
  }, [stocks, selectedSector])

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-gray-900">Sector Comparison</CardTitle>
          <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value as SectorType)}>
            <SelectTrigger className="w-[180px] bg-blue-50 border-blue-200 text-gray-900">
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-100">
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector} className="text-gray-700">
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: "Avg % Change", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => {
                  const num = typeof value === 'number' ? value : parseFloat(value as string)
                  return [`${isNaN(num) ? value : num.toFixed(2)}%`, "Avg Change"]
                }} />
                <Legend />
                <Bar dataKey="avgChange" name="Avg % Change">
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgChange >= 0 ? "#4ade80" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-md border border-blue-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="text-gray-500">Symbol</TableHead>
                  <TableHead className="text-gray-500">LTP</TableHead>
                  <TableHead className="text-gray-500">% Change</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-500">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectorStocks.length > 0 ? (
                  sectorStocks.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium text-blue-700">{stock.symbol}</TableCell>
                      <TableCell className="text-gray-900">{formatNumber(stock.ltp)}</TableCell>
                      <TableCell className={getChangeColor(stock.percentChange)}>{stock.percentChange}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-900">{formatNumber(stock.volume)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                      No stocks found in this sector
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
