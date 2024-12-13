'use client'

import { Card } from "@/components/ui/card"
import { TradingViewTicker } from "./ticker-tradingview"
import { NewPunchBox } from "./new-punch-box"
import { useState, useEffect } from "react"
import { type TradeFormValues } from "@/utils/types"
import { createTrade, getUserPositions } from "@/lib/db/trades"
import { usePortfolio } from "@/contexts/portfolio-context"

interface Ticker {
  symbol: string
}

export function TickerCarousel() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { triggerRefresh } = usePortfolio()

  useEffect(() => {
    async function fetchPositions() {
      try {
        const positions = await getUserPositions()
        // Sort by updated_at and get unique symbols
        const uniqueSymbols = positions
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .reduce<string[]>((acc, pos) => {
            if (!acc.includes(pos.symbol)) {
              acc.push(pos.symbol)
            }
            return acc
          }, [])
        setTickers(uniqueSymbols.map(symbol => ({ symbol })))
      } catch (error) {
        console.error('Error fetching positions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPositions()
  }, [])

  const handleAddTicker = async (values: TradeFormValues) => {
    console.log('TickerCarousel received values:', values)
    const trade = await createTrade(values)
    // Refresh positions after adding a trade
    const positions = await getUserPositions()
    const uniqueSymbols = positions
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .reduce<string[]>((acc, pos) => {
        if (!acc.includes(pos.symbol)) {
          acc.push(pos.symbol)
        }
        return acc
      }, [])
    setTickers(uniqueSymbols.map(symbol => ({ symbol })))
    // Trigger portfolio refresh
    triggerRefresh()
    return trade
  }

  if (isLoading) {
    return <div>Loading tickers...</div>
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
