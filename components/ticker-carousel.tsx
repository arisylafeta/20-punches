'use client'

import { Card } from "@/components/ui/card"
import { TradingViewTicker } from "./ticker-tradingview"
import { TickerAdd } from "./trade-add"
import { useState } from "react"

interface Ticker {
  symbol: string
}

const defaultTickers: Ticker[] = [
  { symbol: "BINANCE:ETHUSDT" },
]

export function TickerCarousel() {
  const [tickers, setTickers] = useState<Ticker[]>(defaultTickers)

  const handleAddTicker = (symbol: string) => {
    setTickers([{ symbol }, ...tickers])
  }

  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      <TickerAdd onAddTicker={handleAddTicker} />
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
