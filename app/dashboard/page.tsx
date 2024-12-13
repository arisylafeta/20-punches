'use client'

import { useEffect, useState } from 'react'
import { calculatePortfolioHistory } from '@/lib/db/trades'
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { PortfolioOverviewComponent } from "@/components/charts/portfolio-overview"
import { LineChartComponent } from "@/components/charts/line-chart"
import { PortfolioSummaryComponent } from "@/components/charts/portfolio-summary"
import { ChartDataPoint, PortfolioChartData } from '@/utils/types'
import { usePortfolio } from '@/contexts/portfolio-context'

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { lastUpdate } = usePortfolio()

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true)
        setError(null)
        const history = await calculatePortfolioHistory(undefined, new Date(), 1)
        
        if (!history || history.length === 0) {
          setError('No portfolio data available')
          return
        }

        // Prepare data for line chart (total portfolio value over time)
        const lineData: ChartDataPoint[] = history.map((day, index) => {
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

        // Prepare data for pie chart (latest day's position allocation)
        const latestDay = history[history.length - 1]
        const pieData = Object.entries(latestDay.positions).map(([symbol, position]) => ({
          symbol,
          value: position.value
        }))

        // Prepare data for bar chart (position values over time)
        const barData = history.map(day => {
          const dataPoint: { timestamp: string; [key: string]: number | string } = {
            timestamp: day.timestamp
          }
          Object.entries(day.positions).forEach(([symbol, position]) => {
            dataPoint[symbol] = position.value
          })
          return dataPoint
        })

        setPortfolioData({
          lineChartData: lineData,
          pieChartData: pieData,
          barChartData: barData
        })
      } catch (err) {
        console.error('Error fetching portfolio data:', err)
        setError('Failed to load portfolio data')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [lastUpdate])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  const currentValue = portfolioData?.lineChartData[portfolioData.lineChartData.length - 1]?.value || 0
  const previousValue = portfolioData?.lineChartData[portfolioData.lineChartData.length - 2]?.value || currentValue
  const dayChange = currentValue - previousValue
  const dayChangePercent = (dayChange / previousValue) * 100

  return (
    <div className="space-y-8">
      <PortfolioOverviewComponent 
        data={portfolioData?.lineChartData}
        topLeftComponent={
          <PortfolioSummaryComponent
            data={portfolioData?.lineChartData || []}
            marketData={[]} // TODO: Add market data (e.g., S&P 500)
          />
        }
        topRightComponent={
          <LineChartComponent data={portfolioData?.lineChartData || []} />
        }
        bottomLeftComponent={
          <BarChartComponent data={portfolioData?.barChartData || []} />
        }
        bottomRightComponent={
          <PieChartComponent data={portfolioData?.pieChartData || []} />
        }
      />
    </div>
  )
}