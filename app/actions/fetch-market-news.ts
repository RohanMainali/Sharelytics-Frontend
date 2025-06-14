"use server"

import * as cheerio from "cheerio"

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  publishedAt: string
  imageUrl?: string
}

export async function fetchMarketNews(): Promise<NewsItem[]> {
  try {
    // Fetch news from Sharesansar
    const response = await fetch("https://www.sharesansar.com/category/latest", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const news: NewsItem[] = []

    // Extract news items
    $(".featured-news-list .row").each((index, element) => {
      if (index >= 10) return // Limit to 10 news items

      const titleElement = $(element).find(".featured-news-title a")
      const title = titleElement.text().trim()
      const url = titleElement.attr("href") || ""

      const summaryElement = $(element).find(".featured-news-content")
      const summary = summaryElement.text().trim()

      const imageElement = $(element).find("img")
      const imageUrl = imageElement.attr("src") || undefined

      const dateElement = $(element).find(".featured-news-date")
      const publishedAt = dateElement.text().trim() || new Date().toISOString()

      if (title && url) {
        news.push({
          id: `news-${index}`,
          title,
          summary,
          source: "Sharesansar",
          url: url.startsWith("http") ? url : `https://www.sharesansar.com${url}`,
          publishedAt,
          imageUrl,
        })
      }
    })

    return news
  } catch (error) {
    console.error("Error fetching market news:", error)

    // Return empty array on error
    return []
  }
}
