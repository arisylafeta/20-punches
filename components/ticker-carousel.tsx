'use client'

import { Card } from "@/components/ui/card"
import { TradingViewTicker } from "./ticker-tradingview"
import { NewPunchBox } from "./new-punch-box"
import { useState, useEffect } from "react"
import { type TradeFormValues } from "@/utils/types"
import { createTrade, getUniqueTradeSymbols } from "@/lib/db/trades"
import { usePortfolio } from "@/contexts/portfolio-context"
import { Skeleton } from "@/components/ui/skeleton"

interface Ticker {
  symbol: string
}

const TickerSkeleton = () => (
  <div className="flex overflow-x-auto scrollbar-hide gap-4 p-4">
    {/* New Punch Box Skeleton */}
    {[...Array(4)].map((_, i) => (
    <Card  key={i} className="w-[300px] h-[120px] flex items-center justify-center p-6">
      <div className="space-y-4 w-full">
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
    ))}
  </div>
)

export function TickerCarousel() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { triggerRefresh, lastUpdate } = usePortfolio()

  useEffect(() => {
    async function fetchSymbols() {
      try {
        const symbols = await getUniqueTradeSymbols()
        console.log('Unique symbols from trades:', symbols)
        setTickers(symbols.map(symbol => ({ symbol })))
      } catch (error) {
        console.error('Error fetching symbols:', error)
      } finally {
        setIsLoading(false)
      }
    }

    console.log('Fetching symbols, lastUpdate:', lastUpdate)
    fetchSymbols()
  }, [lastUpdate])

  const handleAddTicker = async (values: TradeFormValues) => {
    console.log('TickerCarousel received values:', values)
    const trade = await createTrade(values)
    triggerRefresh()
    return trade
  }

  if (isLoading) {
    return <TickerSkeleton />
  }

  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      <NewPunchBox
        onAddPunch={handleAddTicker}
        width="284px"
        height="72px"
        buttonClassName="flex-none w-[284px] mx-2 first:ml-0 last:mr-0 mb-3 mt-3"
      />
      {tickers.map((ticker) => (
        <Card key={ticker.symbol} className="flex-none rounded-xl overflow-hidden mx-2 first:ml-0 last:mr-0 mb-3 mt-3">
          <div className="-m-1">
          <TradingViewTicker symbol={ticker.symbol} />
          </div>
        </Card>
      ))}
    </div>
  )
}
