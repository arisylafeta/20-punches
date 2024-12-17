'use client'

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from 'date-fns'
import { NewsPlaceholder } from "./news-placeholder"
import { ChevronRight, Plus } from 'lucide-react'

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
  type?: 'market' | 'company'
}

export function NewsFeed({ tickers, className = "", type = 'company' }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchNews() {
      try {
        setError(null)
        const ticker = Array.isArray(tickers) ? tickers[0] : tickers
        
        const url = type === 'market' 
          ? `/dashboard/api/news?type=market&page=${page}`
          : `/dashboard/api/news?type=company&tickers=${ticker}&page=${page}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setHasMore(data.length === 5)
        setNews(current => page === 1 ? data : [...current, ...data])
      } catch (error) {
        console.error('Error fetching news:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch news')
      } finally {
        setIsLoading(false)
      }
    }

    if (type === 'market' || tickers) {
      fetchNews()
    }
  }, [tickers, page, type])

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl))
  }

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

  if (!tickers && type !== 'market') {
    return null
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No news available for {type === 'market' ? 'market' : Array.isArray(tickers) ? tickers.join(', ') : tickers}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide gap-4">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none group first:ml-0 last:mr-0"
          >
            <Card className="w-[400px] h-[400px] overflow-hidden hover:bg-muted/50 transition-colors">
              {/* Image */}
              <div className="relative w-full h-48">
                {!failedImages.has(item.image) ? (
                  <Image
                    src={item.image}
                    alt={item.headline}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => handleImageError(item.image)}
                  />
                ) : (
                  <NewsPlaceholder source={item.source} />
                )}
              </div>

              {/* Content */}
              <div className="p-4 h-[208px] flex flex-col">
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
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.headline}
                </h3>
                
                {/* Summary */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.summary}
                </p>
              </div>
            </Card>
          </a>
        ))}

        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="flex-none group focus:outline-none first:ml-0 last:mr-0"
          >
            <Card className="w-[400px] h-[400px] flex flex-col items-center justify-center p-8 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-lg font-semibold text-primary">
                Load more news
              </span>
            </Card>
          </button>
        )}
      </div>
    </div>
  )
}
