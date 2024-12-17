'use client';

import React, { useEffect, useState } from 'react'
import { MiniChart } from "@/components/charts/minichart-tradingview"
import { Card } from "@/components/ui/card"
import { DataTableDemo } from '@/components/trades-table'
import { NewPunchBox } from '@/components/new-punch-box'
import { type TradeFormValues } from "@/utils/types"
import { createTrade, getUserPositions } from "@/lib/db/trades"
import { usePortfolio } from '@/contexts/portfolio-context'

const TOTAL_SLOTS = 20;

export default function PunchesPage() {
  const [positions, setPositions] = useState<{ symbol: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { triggerRefresh, lastUpdate } = usePortfolio()

  useEffect(() => {
    async function fetchPositions() {
      try {
        const userPositions = await getUserPositions()
        // Sort by updated_at and get unique symbols
        const uniqueSymbols = userPositions
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .reduce<string[]>((acc, pos) => {
            if (!acc.includes(pos.symbol)) {
              acc.push(pos.symbol)
            }
            return acc
          }, [])
        setPositions(uniqueSymbols.map(symbol => ({ symbol })))
      } catch (error) {
        console.error('Error fetching positions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPositions()
  }, [lastUpdate])

  const handleAddPunch = async (values: TradeFormValues) => {
    const trade = await createTrade(values)
    triggerRefresh() // This will cause all components using usePortfolio to update
    return trade
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading positions...</div>
  }

  const emptySlots = Math.max(0, TOTAL_SLOTS - positions.length);
  const emptyCards = Array(emptySlots).fill(null);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-4">
        {positions.map(({ symbol }) => (
          <Card key={symbol} className="rounded-xl overflow-hidden mb-3 mt-3">
            <div className="-m-1">
              <MiniChart
                symbol={symbol}
                dateRange="1M"
              />
            </div>
          </Card>
        ))}
        {emptyCards.map((_, index) => (
          <Card 
            key={`empty-${index}`} 
            className="rounded-xl overflow-hidden mb-3 mt-3"
          >
            <NewPunchBox
              onAddPunch={handleAddPunch}
              height="150px"
              width="100%"
              buttonClassName="w-full"
            />
          </Card>
        ))}
      </div>
      <DataTableDemo />
    </div>
  )
}