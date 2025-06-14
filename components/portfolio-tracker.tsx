"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { formatNumber, getChangeColor } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, Trash2, Edit } from "lucide-react"
import { fetchMerolaganiData } from "@/app/actions/fetch-merolagani-data"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sharelytics-backend.onrender.com"

interface PortfolioStock {
  _id?: string
  symbol: string
  quantity: number
  buyPrice: number
  currentPrice: number
  value: number
  profitLoss: number
  profitLossPercentage: number
  lastUpdated: Date
}

export function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newStock, setNewStock] = useState({ symbol: "", quantity: 0, buyPrice: 0 })
  const [editingStock, setEditingStock] = useState<PortfolioStock | null>(null)
  const [loading, setLoading] = useState(false)
  const [totalValue, setTotalValue] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalProfitLoss, setTotalProfitLoss] = useState(0)

  // Load portfolio from backend on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/portfolio`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setPortfolio(data.portfolio || [])
        }
      } catch (err) {}
    }
    fetchPortfolio()
  }, [])

  // Save portfolio to backend whenever it changes
  useEffect(() => {
    const updatePortfolio = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        await fetch(`${BACKEND_URL}/api/user/portfolio`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ portfolio })
        })
      } catch (err) {}
    }
    if (portfolio.length > 0) updatePortfolio()

    // Calculate totals
    let investment = 0
    let value = 0

    portfolio.forEach((stock) => {
      investment += stock.quantity * stock.buyPrice
      value += stock.quantity * stock.currentPrice
    })

    setTotalInvestment(investment)
    setTotalValue(value)
    setTotalProfitLoss(value - investment)
  }, [portfolio])

  const handleAddStock = async () => {
    if (!newStock.symbol || newStock.quantity <= 0 || newStock.buyPrice <= 0) {
      return
    }
    setLoading(true)
    try {
      // Fetch current price from merolagani
      const stockData = await fetchMerolaganiData(newStock.symbol.toUpperCase())
      const currentPrice =
        typeof stockData.ltp === "number"
          ? stockData.ltp
          : Number.parseFloat(stockData.ltp.toString().replace(/,/g, ""))

      if (isNaN(currentPrice)) {
        alert("Could not fetch current price. Please check the symbol and try again.")
        return
      }

      const value = newStock.quantity * currentPrice
      const investment = newStock.quantity * newStock.buyPrice
      const profitLoss = value - investment
      const profitLossPercentage = (profitLoss / investment) * 100
      const newPortfolioStock: Omit<PortfolioStock, '_id'> = {
        symbol: newStock.symbol.toUpperCase(),
        quantity: newStock.quantity,
        buyPrice: newStock.buyPrice,
        currentPrice,
        value,
        profitLoss,
        profitLossPercentage,
        lastUpdated: new Date(),
      }

      // Save to backend and reload
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch(`${BACKEND_URL}/api/user/portfolio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ portfolio: [...portfolio, newPortfolioStock] })
      })
      if (res.ok) {
        const data = await res.json()
        setPortfolio(data.portfolio || [])
        setNewStock({ symbol: "", quantity: 0, buyPrice: 0 })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding stock to portfolio:", error)
      alert("Failed to add stock. Please check the symbol and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditStock = async () => {
    if (!editingStock || editingStock.quantity <= 0 || editingStock.buyPrice <= 0) {
      return
    }
    setLoading(true)
    try {
      // Fetch current price from merolagani
      const stockData = await fetchMerolaganiData(editingStock.symbol)
      const currentPrice =
        typeof stockData.ltp === "number"
          ? stockData.ltp
          : Number.parseFloat(stockData.ltp.toString().replace(/,/g, ""))

      if (isNaN(currentPrice)) {
        alert("Could not fetch current price. Please check the symbol and try again.")
        return
      }

      const value = editingStock.quantity * currentPrice
      const investment = editingStock.quantity * editingStock.buyPrice
      const profitLoss = value - investment
      const profitLossPercentage = (profitLoss / investment) * 100

      const updatedStock: PortfolioStock = {
        ...editingStock,
        currentPrice,
        value,
        profitLoss,
        profitLossPercentage,
        lastUpdated: new Date(),
      }

      const updatedPortfolio = portfolio.map((stock) =>
        stock._id === editingStock._id ? updatedStock : stock
      )

      // Save to backend and reload
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch(`${BACKEND_URL}/api/user/portfolio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ portfolio: updatedPortfolio })
      })
      if (res.ok) {
        const data = await res.json()
        setPortfolio(data.portfolio || [])
        setEditingStock(null)
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating stock in portfolio:", error)
      alert("Failed to update stock. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStock = async (_id: string) => {
    if (confirm("Are you sure you want to remove this stock from your portfolio?")) {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/portfolio/${_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setPortfolio((prev) => prev.filter((stock) => stock._id !== _id))
        }
      } catch (err) {
        // Optionally handle error
      }
    }
  }

  const refreshPortfolio = async () => {
    setLoading(true)
    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (stock) => {
          try {
            const stockData = await fetchMerolaganiData(stock.symbol)
            const currentPrice =
              typeof stockData.ltp === "number"
                ? stockData.ltp
                : Number.parseFloat(stockData.ltp.toString().replace(/,/g, ""))

            if (isNaN(currentPrice)) {
              return stock
            }

            const value = stock.quantity * currentPrice
            const investment = stock.quantity * stock.buyPrice
            const profitLoss = value - investment
            const profitLossPercentage = (profitLoss / investment) * 100

            return {
              ...stock,
              currentPrice,
              value,
              profitLoss,
              profitLossPercentage,
              lastUpdated: new Date(),
            }
          } catch (error) {
            console.error(`Error updating ${stock.symbol}:`, error)
            return stock
          }
        }),
      )

      setPortfolio(updatedPortfolio)
    } catch (error) {
      console.error("Error refreshing portfolio:", error)
      alert("Failed to refresh portfolio. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for pie chart
  const pieChartData = portfolio.map((stock) => ({
    name: stock.symbol,
    value: stock.value,
  }))

  // Colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#8DD1E1",
    "#A4DE6C",
    "#D0ED57",
  ]

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-gray-900">Portfolio Tracker</CardTitle>
            <CardDescription className="text-gray-500">Track your stock investments and performance</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Portfolio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., NABIL"
                      value={newStock.symbol}
                      onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Number of shares"
                      value={newStock.quantity || ""}
                      onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyPrice">Buy Price (NPR)</Label>
                    <Input
                      id="buyPrice"
                      type="number"
                      placeholder="Price per share"
                      value={newStock.buyPrice || ""}
                      onChange={(e) => setNewStock({ ...newStock, buyPrice: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddStock} disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add to Portfolio"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={refreshPortfolio} disabled={loading} className="border-blue-200 text-blue-700 hover:bg-blue-100">
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-0">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500">Total Investment</div>
                  <div className="text-2xl font-bold text-gray-900">NPR {formatNumber(totalInvestment)}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-0">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500">Current Value</div>
                  <div className="text-2xl font-bold text-gray-900">NPR {formatNumber(totalValue)}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-0">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500">Profit/Loss</div>
                  <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    NPR {formatNumber(totalProfitLoss)} ({((totalProfitLoss / totalInvestment) * 100).toFixed(2)}%)
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-md border border-blue-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="text-gray-500">Symbol</TableHead>
                      <TableHead className="text-gray-500">Qty</TableHead>
                      <TableHead className="text-gray-500">Buy Price</TableHead>
                      <TableHead className="text-gray-500">Current</TableHead>
                      <TableHead className="text-gray-500">P/L %</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.map((stock) => (
                      <TableRow key={stock._id}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>{formatNumber(stock.buyPrice)}</TableCell>
                        <TableCell>{formatNumber(stock.currentPrice)}</TableCell>
                        <TableCell className={getChangeColor(stock.profitLossPercentage)}>
                          {stock.profitLossPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Dialog
                              open={isEditDialogOpen && editingStock?._id === stock._id}
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open)
                                if (!open) setEditingStock(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditingStock(stock)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit {editingStock?.symbol}</DialogTitle>
                                </DialogHeader>
                                {editingStock && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-quantity">Quantity</Label>
                                      <Input
                                        id="edit-quantity"
                                        type="number"
                                        value={editingStock.quantity || ""}
                                        onChange={(e) =>
                                          setEditingStock({ ...editingStock, quantity: Number(e.target.value) })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-buyPrice">Buy Price (NPR)</Label>
                                      <Input
                                        id="edit-buyPrice"
                                        type="number"
                                        value={editingStock.buyPrice || ""}
                                        onChange={(e) =>
                                          setEditingStock({ ...editingStock, buyPrice: Number(e.target.value) })
                                        }
                                      />
                                    </div>
                                    <Button onClick={handleEditStock} disabled={loading} className="w-full">
                                      {loading ? "Updating..." : "Update Stock"}
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStock(stock._id!)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `NPR ${formatNumber(value as number)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Your portfolio is empty. Add stocks to track your investments.</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Your First Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Portfolio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., NABIL"
                      value={newStock.symbol}
                      onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Number of shares"
                      value={newStock.quantity || ""}
                      onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyPrice">Buy Price (NPR)</Label>
                    <Input
                      id="buyPrice"
                      type="number"
                      placeholder="Price per share"
                      value={newStock.buyPrice || ""}
                      onChange={(e) => setNewStock({ ...newStock, buyPrice: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddStock} disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add to Portfolio"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
