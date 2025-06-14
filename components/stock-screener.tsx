"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatNumber, getChangeColor } from "@/lib/utils"
import type { SharesansarStock } from "@/app/actions/fetch-sharesansar-data"

interface StockScreenerProps {
  stocks: SharesansarStock[]
  onSelectSymbol: (symbol: string) => void
}

export function StockScreener({ stocks, onSelectSymbol }: StockScreenerProps) {
  const [filteredStocks, setFilteredStocks] = useState<SharesansarStock[]>([])
  const [filters, setFilters] = useState({
    sector: "all",
    minPrice: 0,
    maxPrice: 10000,
    minVolume: 0,
    positiveChange: false,
    sortBy: "symbol",
    sortOrder: "asc" as "asc" | "desc",
  })
  const [showFilters, setShowFilters] = useState(false)

  const sectors = [
    { id: "all", name: "All Sectors" },
    { id: "commercial-banks", name: "Commercial Banks" },
    { id: "development-banks", name: "Development Banks" },
    { id: "finance", name: "Finance" },
    { id: "life-insurance", name: "Life Insurance" },
    { id: "non-life-insurance", name: "Non Life Insurance" },
    { id: "hydropower", name: "Hydropower" },
    { id: "manufacturing", name: "Manufacturing" },
    { id: "microfinance", name: "Microfinance" },
    { id: "investment", name: "Investment" },
    { id: "hotel", name: "Hotel & Tourism" },
    { id: "trading", name: "Trading" },
  ]

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    let result = [...stocks]

    // Apply sector filter
    if (filters.sector !== "all") {
      result = result.filter((stock) => stock.sector.toLowerCase().includes(filters.sector.replace("-", " ")))
    }

    // Apply price filter
    result = result.filter((stock) => {
      const price = Number.parseFloat(stock.ltp.toString().replace(/,/g, ""))
      return !isNaN(price) && price >= filters.minPrice && price <= filters.maxPrice
    })

    // Apply volume filter
    result = result.filter((stock) => {
      const volume = Number.parseFloat(stock.volume.toString().replace(/,/g, ""))
      return !isNaN(volume) && volume >= filters.minVolume
    })

    // Apply change filter
    if (filters.positiveChange) {
      result = result.filter((stock) => {
        const change = Number.parseFloat(stock.percentChange.toString().replace(/[+%]/g, ""))
        return !isNaN(change) && change > 0
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[filters.sortBy as keyof SharesansarStock]
      let bValue = b[filters.sortBy as keyof SharesansarStock]

      // Convert to numbers if needed
      if (["ltp", "pointChange", "percentChange", "volume"].includes(filters.sortBy)) {
        aValue = Number.parseFloat(aValue.toString().replace(/[+,%]/g, ""))
        bValue = Number.parseFloat(bValue.toString().replace(/[+,%]/g, ""))
      } else {
        aValue = aValue.toString()
        bValue = bValue.toString()
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredStocks(result)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Stock Screener</CardTitle>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={filters.sector} onValueChange={(value) => handleFilterChange("sector", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex space-x-2">
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="symbol">Symbol</SelectItem>
                      <SelectItem value="ltp">Price</SelectItem>
                      <SelectItem value="percentChange">% Change</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => handleFilterChange("sortOrder", value as "asc" | "desc")}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price Range (NPR)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Minimum Volume</Label>
                <Input
                  type="number"
                  value={filters.minVolume}
                  onChange={(e) => handleFilterChange("minVolume", Number(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="positive-change"
                  checked={filters.positiveChange}
                  onCheckedChange={(checked) => handleFilterChange("positiveChange", checked)}
                />
                <Label htmlFor="positive-change">Only Positive Change</Label>
              </div>
            </div>

            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        )}

        {filteredStocks.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>LTP</TableHead>
                  <TableHead>% Change</TableHead>
                  <TableHead className="hidden md:table-cell">Volume</TableHead>
                  <TableHead className="hidden md:table-cell">Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow
                    key={stock.symbol}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => onSelectSymbol(stock.symbol)}
                  >
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{formatNumber(stock.ltp)}</TableCell>
                    <TableCell className={getChangeColor(stock.percentChange)}>{stock.percentChange}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatNumber(stock.volume)}</TableCell>
                    <TableCell className="hidden md:table-cell">{stock.sector}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Use the filters above to find stocks matching your criteria</p>
            <Button onClick={applyFilters} className="mt-2">
              Show All Stocks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
