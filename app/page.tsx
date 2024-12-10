'use client'

import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import TradingviewChart from '@/components/charts/tradingview-chart'
import { Card } from "@/components/ui/card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { LineChartComponent } from "@/components/charts/line-chart"
import { RadialChartComponent } from "@/components/charts/radial-chart"
import { HalfRadialChartComponent } from "@/components/charts/half-radial-chart"
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart"
import { RadarChartComponent } from "@/components/charts/radar-chart"
import { TickerCarousel } from "@/components/ticker-carousel"


const Home = () => {
  return (
    <>

          <TickerCarousel />

      <BarChartComponent/>
      <PieChartComponent/>

      <LineChartComponent/>

      <RadialChartComponent/>
      <HalfRadialChartComponent/>
      <StackedBarChartComponent/>
      <RadarChartComponent/>

      {/* Chart container */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <TradingviewChart/>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}

export default Home