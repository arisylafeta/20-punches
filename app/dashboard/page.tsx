'use client'

import TradingviewChart from '@/components/charts/chart-tradingview'
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { LineChartComponent } from "@/components/charts/line-chart"
import { RadialChartComponent } from "@/components/charts/radial-chart"
import { HalfRadialChartComponent } from "@/components/charts/half-radial-chart"
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart"
import { RadarChartComponent } from "@/components/charts/radar-chart"
import { getPortfolioTimeSeries, calculatePortfolioHistory } from '@/lib/db/trades'
import { Button } from '@/components/ui/button'


const DashboardPage = () => {
  const testPortfolio = async () => {
    try {
      // Get basic position time series
      const timeSeries = await getPortfolioTimeSeries()
      console.log('Portfolio Time Series:', JSON.stringify(timeSeries, null, 2))

      // Get portfolio history with values
      const portfolioHistory = await calculatePortfolioHistory()
      console.log('Portfolio History with Values:', JSON.stringify(portfolioHistory, null, 2))
    } catch (error) {
      console.error('Error calculating portfolio:', error)
    }
  }

  return (
    <div className="p-4">
      <Button onClick={testPortfolio} className="mb-4">
        Test Portfolio Calculation
      </Button>

      {/* Place these in some grid layout with text and shit */}
      <BarChartComponent/>
      <PieChartComponent/>

      <LineChartComponent/>

      <RadialChartComponent/>
      <HalfRadialChartComponent/>
      <StackedBarChartComponent/>
      <RadarChartComponent/>

         {/* <TradingviewChart/> */} 
    </div>
  )
}

export default DashboardPage