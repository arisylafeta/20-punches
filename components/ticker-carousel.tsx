'use client'

import { Card } from "@/components/ui/card"
import { TradingViewTicker } from "./tradingview-ticker"

const tickers = [
  { symbol: "BINANCE:BTCUSDT" },
  { symbol: "BINANCE:ETHUSDT" },
  { symbol: "BINANCE:SOLUSDT" },
  { symbol: "BINANCE:AVAXUSDT" },
  { symbol: "BINANCE:DOGEUSDT" },
  { symbol: "BINANCE:MATICUSDT" },
  { symbol: "BINANCE:LINKUSDT" },
  { symbol: "BINANCE:UNIUSDT" },
  { symbol: "BINANCE:AAVEUSDT" },
  { symbol: "BINANCE:SUSHIUSDT" },
]

export function TickerCarousel() {
  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      {tickers.map((ticker) => (
        <Card key={ticker.symbol} className="flex-none  rounded-xl overflow-hidden mx-2 first:ml-0 last:mr-0 mb-3 mt-3">
          <div className="-m-1">
            <TradingViewTicker symbol={ticker.symbol} />
          </div>
        </Card>
      ))}
    </div>
  )
}
