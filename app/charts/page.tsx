'use client'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import TradingviewChart from '@/components/charts/chart-tradingview'


const ChartsPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-7xl h-[80vh] border border-white/20 rounded-lg p-4 m-4">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <TradingviewChart/>
          </ResizablePanel>
          <ResizableHandle/>
          <ResizablePanel>Two</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default ChartsPage