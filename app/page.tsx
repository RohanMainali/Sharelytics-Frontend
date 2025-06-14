"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SectorTable } from "@/components/sector-table"
import { StockDetail } from "@/components/stock-detail"
import { Watchlist } from "@/components/watchlist"
import { RefreshButton } from "@/components/refresh-button"
import { fetchSharesansarData, type SharesansarStock } from "@/app/actions/fetch-sharesansar-data"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { groupStocksBySector, type SectorType } from "@/lib/sectors"
import { SectorNavigation } from "@/components/sector-navigation"
import { StockScreener } from "@/components/stock-screener"
import { PortfolioTracker } from "@/components/portfolio-tracker"
import { MarketNews } from "@/components/market-news"
import { SectorComparison } from "@/components/sector-comparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, BarChart3, Users, Briefcase } from "lucide-react"

export default function RootPage() {
  // Client-side authentication check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  const [stocks, setStocks] = useState<SharesansarStock[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [stocksBySector, setStocksBySector] = useState<Record<SectorType, SharesansarStock[]>>({
    "Commercial Banks": [],
    "Development Banks": [],
    Finance: [],
    "Life Insurance": [],
    "Non Life Insurance": [],
    Hydropower: [],
    "Manufacturing and Processing": [],
    Microfinance: [],
    Investment: [],
    "Hotel and Tourism": [],
    Trading: [],
    Other: [],
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchSharesansarData()
      setStocks(data)

      // Group stocks by sector
      const grouped = groupStocksBySector(data)
      setStocksBySector(grouped)

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchData, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [])

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol)
    setActiveTab("details")
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section with Market Overview */}
        <section className="mb-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-sm">
              NEPAL SHARE ANALYSIS
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Your comprehensive dashboard for the Nepal stock market
            </p>
            <div className="flex justify-center">
              <RefreshButton onRefresh={fetchData} lastUpdated={lastUpdated} />
            </div>
          </div>
          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition text-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">Total Stocks</CardTitle>
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stocks.length}</div>
                <p className="text-xs text-gray-400">Active securities</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition text-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">Market Activity</CardTitle>
                <Activity className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Live</div>
                <p className="text-xs text-gray-400">Real-time data</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition text-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">Gainers</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {stocks.filter(s => parseFloat(s.percentChange.toString().replace(/[+%]/g, '')) > 0).length}
                </div>
                <p className="text-xs text-gray-400">Positive stocks</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition text-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">Losers</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {stocks.filter(s => parseFloat(s.percentChange.toString().replace(/[+%]/g, '')) < 0).length}
                </div>
                <p className="text-xs text-gray-400">Declining stocks</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <SectorNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="all">
                {loading && stocks.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Loading stock data...</p>
                  </div>
                ) : (
                  <SectorTable stocks={stocks} sectorName="All Stocks" onSelectSymbol={handleSelectSymbol} />
                )}
              </TabsContent>

              <TabsContent value="commercial-banks">
                <SectorTable
                  stocks={stocksBySector["Commercial Banks"]}
                  sectorName="Commercial Banks"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="development-banks">
                <SectorTable
                  stocks={stocksBySector["Development Banks"]}
                  sectorName="Development Banks"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="finance">
                <SectorTable
                  stocks={stocksBySector["Finance"]}
                  sectorName="Finance"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="life-insurance">
                <SectorTable
                  stocks={stocksBySector["Life Insurance"]}
                  sectorName="Life Insurance"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="non-life-insurance">
                <SectorTable
                  stocks={stocksBySector["Non Life Insurance"]}
                  sectorName="Non Life Insurance"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="hydropower">
                <SectorTable
                  stocks={stocksBySector["Hydropower"]}
                  sectorName="Hydropower"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="manufacturing">
                <SectorTable
                  stocks={stocksBySector["Manufacturing and Processing"]}
                  sectorName="Manufacturing and Processing"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="microfinance">
                <SectorTable
                  stocks={stocksBySector["Microfinance"]}
                  sectorName="Microfinance"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="investment">
                <SectorTable
                  stocks={stocksBySector["Investment"]}
                  sectorName="Investment"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="hotel">
                <SectorTable
                  stocks={stocksBySector["Hotel and Tourism"]}
                  sectorName="Hotel and Tourism"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="trading">
                <SectorTable
                  stocks={stocksBySector["Trading"]}
                  sectorName="Trading"
                  onSelectSymbol={handleSelectSymbol}
                />
              </TabsContent>

              <TabsContent value="details">
                <StockDetail symbol={selectedSymbol} />
              </TabsContent>

              <TabsContent value="screener">
                <StockScreener stocks={stocks} onSelectSymbol={handleSelectSymbol} />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioTracker />
              </TabsContent>

              <TabsContent value="news">
                <MarketNews />
              </TabsContent>

              <TabsContent value="sector-comparison">
                <SectorComparison stocks={stocks} />
              </TabsContent>
            </Tabs>
          </div>
          <aside className="lg:col-span-1">
            <div className="sticky top-24 pt-8 space-y-8">
              <Watchlist
                onSelectSymbol={(symbol) => {
                  setSelectedSymbol(symbol)
                  setActiveTab("details")
                }}
              />
              <Card className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold mb-3 text-gray-800">Analysis Tools</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("screener")}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                  >
                    Stock Screener
                  </button>
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                  >
                    Portfolio Tracker
                  </button>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                  >
                    Market News
                  </button>
                  <button
                    onClick={() => setActiveTab("sector-comparison")}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                  >
                    Sector Comparison
                  </button>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
