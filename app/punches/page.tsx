import React from 'react'
import { stockList } from "./actions"
import { MiniChart } from "@/components/charts/minichart-tradingview"
import { Card } from "@/components/ui/card"
import { DataTableDemo } from '@/components/trades-table'

export default function PunchesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-4">
        {stockList.map((symbol) => (
          <Card key={symbol} className="rounded-xl overflow-hidden mb-3 mt-3">
            <div className="-m-1">
              <MiniChart
                symbol={symbol}
                dateRange="1M"
              />
            </div>
          </Card>
        ))}
      </div>
      <DataTableDemo />
    </div>
  )
}