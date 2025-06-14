"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import { fetchMarketNews, type NewsItem } from "@/app/actions/fetch-market-news"

export function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const data = await fetchMarketNews()
        setNews(data)
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()

    // Refresh news every 15 minutes
    const intervalId = setInterval(fetchNews, 15 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString // Return the original string if parsing fails
    }
  }

  const filteredNews =
    activeTab === "all"
      ? news
      : news.filter((item) => {
          if (activeTab === "market")
            return item.title.toLowerCase().includes("market") || item.title.toLowerCase().includes("nepse")
          if (activeTab === "economy")
            return item.title.toLowerCase().includes("economy") || item.title.toLowerCase().includes("policy")
          if (activeTab === "companies")
            return item.title.toLowerCase().includes("companies") || item.title.toLowerCase().includes("earnings")
          return true
        })

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">Market News</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-blue-50">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-100 text-gray-700">All News</TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-blue-100 text-gray-700">Market</TabsTrigger>
            <TabsTrigger value="economy" className="data-[state=active]:bg-blue-100 text-gray-700">Economy</TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-blue-100 text-gray-700">Companies</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-md bg-blue-100" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-blue-100" />
                      <Skeleton className="h-4 w-3/4 bg-blue-100" />
                      <Skeleton className="h-4 w-1/2 bg-blue-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-4 p-2 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      {item.imageUrl && (
                        <div className="hidden sm:block">
                          <img
                            src={item.imageUrl || "/placeholder.svg?height=100&width=200"}
                            alt=""
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium flex items-center text-gray-900">
                          {item.title}
                          <ExternalLink className="h-3 w-3 ml-1 inline text-gray-400" />
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.source} • {formatDate(item.publishedAt)}
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-400">No news found for this category</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
