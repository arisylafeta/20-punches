'use client'

import { Card } from "@/components/ui/card"
import { TradingViewTicker } from "./tradingview-ticker"

const tickers = [
  { symbol: "FX:EURUSD", name: "EUR/USD" },
  { symbol: "FX:GBPUSD", name: "GBP/USD" },
  { symbol: "NASDAQ:AAPL", name: "Apple" },
  { symbol: "NASDAQ:GOOGL", name: "Google" },
  { symbol: "NASDAQ:MSFT", name: "Microsoft" },
  { symbol: "NASDAQ:AMZN", name: "Amazon" },
  { symbol: "CRYPTO:BTCUSD", name: "Bitcoin" },
  { symbol: "CRYPTO:ETHUSD", name: "Ethereum" }
]

export function TickerCarousel() {
  return (
    <div className="relative w-full">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-flex gap-4 p-4 w-max">
          {tickers.map((ticker) => (
            <Card key={ticker.symbol} className="flex-none w-[300px] rounded-xl overflow-hidden">
              <div className="-m-1">
                <TradingViewTicker symbol={ticker.symbol} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
