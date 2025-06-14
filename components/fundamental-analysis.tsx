"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { MerolaganiStock } from "@/app/actions/fetch-merolagani-data"

interface FundamentalAnalysisProps {
  stockData: MerolaganiStock | null
  loading: boolean
}

export function FundamentalAnalysis({ stockData, loading }: FundamentalAnalysisProps) {
  const [quarterlyData, setQuarterlyData] = useState<any[]>([])

  useEffect(() => {
    if (stockData?.quarterlyEarnings) {
      // Transform quarterly earnings data for chart
      const chartData = stockData.quarterlyEarnings
        .map((q) => ({
          quarter: q.quarter,
          eps: Number.parseFloat(q.eps.replace(/,/g, "")),
        }))
        .filter((d) => !isNaN(d.eps))

      setQuarterlyData(chartData)
    }
  }, [stockData])

  if (!stockData && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundamental Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a stock to view fundamental analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fundamental Analysis {stockData?.symbol && `- ${stockData.symbol}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="key-ratios">
          <TabsList className="mb-4">
            <TabsTrigger value="key-ratios">Key Ratios</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Results</TabsTrigger>
            <TabsTrigger value="dividends">Dividends</TabsTrigger>
          </TabsList>

          <TabsContent value="key-ratios">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : stockData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">EPS</div>
                    <div className="text-xl font-bold">{stockData.eps}</div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="text-xl font-bold">{stockData.peRatio}</div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">Book Value</div>
                    <div className="text-xl font-bold">{stockData.bookValue}</div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">PBV</div>
                    <div className="text-xl font-bold">{stockData.pbv}</div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="text-xl font-bold">{stockData.marketCapitalization}</div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">Sector P/E</div>
                    <div className="text-xl font-bold">{stockData.sectorPE || "N/A"}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Valuation Analysis</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Analysis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>P/E Ratio</TableCell>
                        <TableCell>{stockData.peRatio}</TableCell>
                        <TableCell>
                          {typeof stockData.peRatio === "number" && typeof stockData.sectorPE === "number" ? (
                            stockData.peRatio < stockData.sectorPE ? (
                              <span className="text-green-600">Below sector average - potentially undervalued</span>
                            ) : (
                              <span className="text-amber-600">Above sector average - potentially overvalued</span>
                            )
                          ) : (
                            "Insufficient data for analysis"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PBV</TableCell>
                        <TableCell>{stockData.pbv}</TableCell>
                        <TableCell>
                          {typeof stockData.pbv === "number" ? (
                            stockData.pbv < 1 ? (
                              <span className="text-green-600">Below book value - potentially undervalued</span>
                            ) : stockData.pbv < 3 ? (
                              <span className="text-blue-600">Moderate valuation</span>
                            ) : (
                              <span className="text-amber-600">High valuation - potentially overvalued</span>
                            )
                          ) : (
                            "Insufficient data for analysis"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>EPS</TableCell>
                        <TableCell>{stockData.eps}</TableCell>
                        <TableCell>
                          {typeof stockData.eps === "number" ? (
                            stockData.eps > 0 ? (
                              <span className="text-green-600">Positive earnings</span>
                            ) : (
                              <span className="text-red-600">Negative earnings</span>
                            )
                          ) : (
                            "Insufficient data for analysis"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No fundamental data available</p>
            )}
          </TabsContent>

          <TabsContent value="quarterly">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : stockData?.quarterlyEarnings && stockData.quarterlyEarnings.length > 0 ? (
              <div className="space-y-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}`, "EPS"]} />
                      <Legend />
                      <Bar dataKey="eps" fill="#8884d8" name="EPS" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead>EPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.quarterlyEarnings.map((quarter, index) => (
                      <TableRow key={index}>
                        <TableCell>{quarter.quarter}</TableCell>
                        <TableCell>{quarter.eps}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No quarterly data available</p>
            )}
          </TabsContent>

          <TabsContent value="dividends">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : stockData?.dividendHistory && stockData.dividendHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Cash Dividend</TableHead>
                    <TableHead>Bonus Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.dividendHistory.map((dividend, index) => (
                    <TableRow key={index}>
                      <TableCell>{dividend.year}</TableCell>
                      <TableCell>{dividend.cash}</TableCell>
                      <TableCell>{dividend.bonus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No dividend history available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
