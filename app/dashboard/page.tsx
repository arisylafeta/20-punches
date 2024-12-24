'use client'

import { useEffect, useState } from 'react'
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
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  // Get tickers for TradingView widget
  const tickers = pieData.map(item => item.symbol)

  return (
    <div className="space-y-8 p-4">
      <PortfolioOverviewComponent 
        topLeftComponent={
          <PortfolioSummaryComponent
            data={overviewData}
            marketData={[]} // TODO: Add market data (e.g., S&P 500)
            isPremium={isPremium}
          />
        }
        topRightComponent={
          <LineChartComponent />
        }
        bottomLeftComponent={
          <BarChartComponent />
        }
        bottomRightComponent={
          <PieChartComponent data={pieData} />
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <NewsFeed 
            type="market"
          />
          <TradingViewWidget 
            watchlist={tickers} 
            height={700}
          />
        </div>
      </div>
    </div>
  )
}