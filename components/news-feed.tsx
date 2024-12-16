'use client'

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from 'date-fns'

interface NewsItem {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

interface NewsFeedProps {
  tickers?: string | string[]
  className?: string
}

export function NewsFeed({ tickers, className = "" }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        setError(null)
        const ticker = Array.isArray(tickers) ? tickers[0] : tickers
        console.log('Fetching news for ticker:', ticker)
        
        const response = await fetch(
          `/dashboard/api/news?tickers=${ticker}&page=${page}`
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log(`Received ${data.length} news items`)
        setHasMore(data.length === 10)
        setNews(current => page === 1 ? data : [...current, ...data])
      } catch (error) {
        console.error('Error fetching news:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch news')
      } finally {
        setIsLoading(false)
      }
    }

    if (tickers) {
      fetchNews()
    }
  }, [tickers, page])

  if (isLoading && page === 1) {
    return <div className="text-center py-8">Loading news...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error}
      </div>
    )
  }

  if (!tickers) {
    return null
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No news available for {Array.isArray(tickers) ? tickers.join(', ') : tickers}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
        {news.map((item) => (
          <Card 
            key={item.id} 
            className="flex-none w-[400px] overflow-hidden hover:bg-muted/50 transition-colors"
          >
            {/* Image */}
            <div className="relative w-full h-48 bg-muted">
              <Image
                src={item.image || '/placeholder-news.jpg'}
                alt={item.headline}
                fill
                className="object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/placeholder-news.jpg';
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm font-medium">
                  {item.source}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {item.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                  {item.related}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(item.datetime * 1000), { addSuffix: true })}
                </span>
              </div>
              
              {/* Headline */}
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.headline}
                </h3>
              </a>
              
              {/* Summary */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {item.summary}
              </p>

              {/* Read More Link */}
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Read more →
              </a>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-3 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors mt-4"
        >
          Load more news
        </button>
      )}
    </div>
  )
}
