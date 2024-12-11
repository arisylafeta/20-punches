'use client'

import TradingviewChart from '@/components/charts/chart-tradingview'
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { LineChartComponent } from "@/components/charts/line-chart"
import { RadialChartComponent } from "@/components/charts/radial-chart"
import { HalfRadialChartComponent } from "@/components/charts/half-radial-chart"
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart"
import { RadarChartComponent } from "@/components/charts/radar-chart"


const DashboardPage = () => {
  return (
    <>
    cica
      {/* Place these in some grid layout with text and shit */}
      <BarChartComponent/>
      <PieChartComponent/>

      <LineChartComponent/>

      <RadialChartComponent/>
      <HalfRadialChartComponent/>
      <StackedBarChartComponent/>
      <RadarChartComponent/>

         {/* <TradingviewChart/> */} 
    </>
  )
}

export default DashboardPage