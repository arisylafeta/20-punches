'use client'

import { useEffect, useState, Suspense } from 'react'
import { calculatePortfolioHistory } from '@/lib/db/trades'
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { PortfolioOverviewComponent } from "@/components/charts/portfolio-overview"
import { LineChartComponent } from "@/components/charts/line-chart"
import { PortfolioSummaryComponent } from "@/components/charts/portfolio-summary"
import { PositionDataPoint, ChartDataPoint } from '@/utils/types'
import { usePortfolio } from '@/contexts/portfolio-context'
import { NewsFeed } from "@/components/news-feed"
import TradingViewWidget from "@/components/charts/chart-tradingview"
import { createClient } from '@/utils/supabase/client'
import { getSubscription } from '@/lib/db/users'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Skeleton components for each chart type
const ChartSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="aspect-[16/9] w-full">
        <Skeleton responsive />
      </div>
    </div>
  </div>
)

const PortfolioOverviewSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    {/* First row */}
    <div className="flex gap-6">
      <Skeleton className="h-[300px] w-1/3" />
      <Skeleton className="h-[300px] w-2/3" />
    </div>
    {/* Second row */}
    <div className="flex gap-6">
      <Skeleton className="h-[300px] w-2/3" />
      <Skeleton className="h-[300px] w-1/3" />
    </div>
  </div>
)

const NewsFeedSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const [pieData, setPieData] = useState<PositionDataPoint[]>([])
  const [overviewData, setOverviewData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const { lastUpdate } = usePortfolio()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        // Check subscription status
        const subscription = await getSubscription(supabase)
        const premium = subscription?.prices?.products?.name?.toLowerCase().includes('premium') ?? false
        setIsPremium(premium)

        const history = await calculatePortfolioHistory(undefined, new Date())
        
        if (!history || history.length === 0) {
          setError('No portfolio data available')
          return
        }

        // Prepare data for pie chart (latest day's position allocation)
        const latestDay = history[history.length - 1]
        const pieData = Object.entries(latestDay.positions).map(([symbol, position]) => ({
          symbol,
          value: position.value
        }))

        // Prepare data for overview (total portfolio value over time)
        const overviewData = history.map((day, index) => {
          const previousDay = index > 0 ? history[index - 1] : null;
          const deposit = previousDay 
            ? Object.entries(day.positions).reduce((sum, [symbol, position]) => {
                const prevPosition = previousDay.positions[symbol];
                if (!prevPosition) return sum + position.value; // New position, count as deposit
                const shareChange = position.shares - prevPosition.shares;
                return sum + (shareChange > 0 ? shareChange * position.avgPrice : 0); // Only count buys as deposits
              }, 0)
            : 0;

          return {
            timestamp: day.timestamp,
            value: day.totalValue,
            deposit: deposit
          };
        });

        setPieData(pieData)
        setOverviewData(overviewData)
      } catch (err) {
        console.error('Error fetching portfolio data:', err)
        setError('Failed to load portfolio data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lastUpdate])

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <PortfolioOverviewSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <NewsFeedSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  // Get tickers for TradingView widget
  const tickers = pieData.map(item => item.symbol)

  return (
    <div className="space-y-8 p-4">
      <PortfolioOverviewComponent 
        topLeftComponent={
          <Suspense fallback={<ChartSkeleton />}>
            <PortfolioSummaryComponent
              data={overviewData}
              marketData={[]}
              isPremium={isPremium}
            />
          </Suspense>
        }
        topRightComponent={
          <Suspense fallback={<ChartSkeleton />}>
            <LineChartComponent />
          </Suspense>
        }
        bottomLeftComponent={
          <Suspense fallback={<ChartSkeleton />}>
            <BarChartComponent />
          </Suspense>
        }
        bottomRightComponent={
          <Suspense fallback={<ChartSkeleton />}>
            <PieChartComponent data={pieData} />
          </Suspense>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Suspense fallback={<NewsFeedSkeleton />}>
            <NewsFeed type="market" />
          </Suspense>
          <Suspense fallback={<Skeleton className="w-full h-[700px]" responsive />}>
            <TradingViewWidget 
              watchlist={tickers} 
              height={700}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}