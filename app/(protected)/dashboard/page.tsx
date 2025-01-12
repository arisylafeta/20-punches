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
import { Onboarding } from "@/components/onboarding"

// Skeleton components for each chart type
const ChartSkeleton = () => (
  <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6 h-full">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="aspect-[16/9] w-full h-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  </div>
)

const PortfolioOverviewSkeleton = () => (
  <div className="w-full bg-background">
    <div className="p-4 space-y-6">
      {/* First row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="w-full lg:w-2/3">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
      {/* Second row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="w-full lg:w-1/3">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  </div>
)

const NewsFeedSkeleton = () => (
  <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
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
  const [ratioData, setRatioData] = useState<ChartDataPoint[]>([])
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

        // Fetch display data (1 month for charts)
        const displayHistory = await calculatePortfolioHistory(undefined, new Date(), "1M")
        
        // Fetch ratio data (1 year for calculations)
        const ratioHistory = await calculatePortfolioHistory(undefined, new Date(), "1Y")
        
        if (!displayHistory || displayHistory.length === 0) {
          setOverviewData([])
          setPieData([])
          setRatioData([])
          setLoading(false)
          return
        }

        // Prepare data for pie chart (latest day's position allocation)
        const latestDay = displayHistory[displayHistory.length - 1]
        const pieData = Object.entries(latestDay.positions).map(([symbol, position]) => ({
          symbol,
          value: position.value
        }))

        // Prepare data for overview (total portfolio value over time)
        const overviewData = displayHistory.map((day, index) => {
          const previousDay = index > 0 ? displayHistory[index - 1] : null;
          const deposit = previousDay 
            ? Object.entries(day.positions).reduce((sum, [symbol, position]) => {
                const prevPosition = previousDay.positions[symbol];
                if (!prevPosition) return sum + position.value;
                const shareChange = position.shares - prevPosition.shares;
                return sum + (shareChange > 0 ? shareChange * position.avgPrice : 0);
              }, 0)
            : 0;

          return {
            timestamp: day.timestamp,
            value: day.totalValue,
            deposit: deposit
          };
        });

        // Prepare data for ratio calculations
        const ratioData = ratioHistory.map(day => ({
          timestamp: day.timestamp,
          value: day.totalValue
        }));

        setPieData(pieData)
        setOverviewData(overviewData)
        setRatioData(ratioData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
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

  if (overviewData.length === 0) {
    return <Onboarding />
  }

  // Get tickers for TradingView widget
  const tickers = pieData.map(item => item.symbol)

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
        <PortfolioOverviewComponent 
          topLeftComponent={
            <Suspense fallback={<ChartSkeleton />}>
              <PortfolioSummaryComponent
                data={overviewData}
                ratioData={ratioData}
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
          isPremium={isPremium}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">News</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <Suspense fallback={<NewsFeedSkeleton />}>
              <NewsFeed type="market" />
            </Suspense>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Charts</h2>
        <div className="grid grid-cols-1 gap-4">
          <Suspense fallback={<Skeleton className="w-full h-[700px]" />}>
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