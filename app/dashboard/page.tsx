'use client'

import { useEffect, useState } from 'react'
import { calculatePortfolioHistory } from '@/lib/db/trades'
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { LineChartComponent } from "@/components/charts/line-chart"
import { ChartDataPoint, PortfolioChartData, PositionDataPoint } from '@/utils/types'
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

        console.log('Fetching portfolio history...')
        const history = await calculatePortfolioHistory()
        console.log('Raw portfolio history:', JSON.stringify(history, null, 2))
        
        if (!history || history.length === 0) {
          console.warn('No portfolio history data available')
          setError('No portfolio data available')
          return
        }

        // Log available symbols
        const symbols = new Set<string>()
        history.forEach(day => {
          Object.keys(day.positions).forEach(symbol => symbols.add(symbol))
        })
        console.log('Available symbols:', Array.from(symbols))

        // Prepare data for line chart (total portfolio value over time)
        const lineData: ChartDataPoint[] = history.map(day => ({
          timestamp: day.timestamp,
          value: day.totalValue
        }))
        console.log('Line chart data:', JSON.stringify(lineData, null, 2))

        // Prepare data for pie chart (latest day's position allocation)
        const latestDay = history[history.length - 1]
        console.log('Latest day data:', JSON.stringify(latestDay, null, 2))
        
        const pieData: PositionDataPoint[] = Object.entries(latestDay.positions).map(([symbol, position]) => ({
          symbol,
          value: position.value
        }))
        console.log('Pie chart data:', JSON.stringify(pieData, null, 2))

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
        console.log('Bar chart data structure:', JSON.stringify(barData, null, 2))
        console.log('Bar chart first data point:', JSON.stringify(barData[0], null, 2))
        console.log('Bar chart last data point:', JSON.stringify(barData[barData.length - 1], null, 2))

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

  return (
    <div>
      <LineChartComponent data={portfolioData?.lineChartData || []} />
      <PieChartComponent data={portfolioData?.pieChartData || []} />
      <BarChartComponent data={portfolioData?.barChartData || []} />
    </div>
  )
}