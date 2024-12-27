'use client';

import React, { useEffect, useState } from 'react'
import { MiniChart } from "@/components/charts/minichart-tradingview"
import { Card } from "@/components/ui/card"
import { DataTableDemo } from '@/components/trades-table'
import { NewPunchBox } from '@/components/new-punch-box'
import { type TradeFormValues } from "@/utils/types"
import { createTrade, getUniqueSymbols, getPortfolioTimeSeries } from "@/lib/db/trades"
import { usePortfolio } from '@/contexts/portfolio-context'
import { Skeleton } from "@/components/ui/skeleton"

const TOTAL_SLOTS = 20;

const PunchCardSkeleton = () => (
  <div className="container mx-auto p-4">
    <div className="grid grid-cols-4 gap-4">
      {[...Array(20)].map((_, i) => (
        <Card key={i} className="p-4 space-y-2 mb-1 mt-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </Card>
      ))}
    </div>
  </div>
)

export default function PunchesPage() {
  const [positions, setPositions] = useState<{ symbol: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { triggerRefresh, lastUpdate } = usePortfolio()

  useEffect(() => {
    async function fetchPositions() {
      try {
        const portfolioTimeSeries = await getPortfolioTimeSeries()
        const uniqueSymbols = getUniqueSymbols(portfolioTimeSeries)
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
    console.log('handleAddPunch called with values:', values)
    try {
      const trade = await createTrade(values)
      console.log('Trade created successfully:', trade)
      triggerRefresh() // This will cause all components using usePortfolio to update
      console.log('Portfolio refresh triggered')
      return trade
    } catch (error) {
      console.error('Error in handleAddPunch:', error)
      throw error
    }
  };

  if (isLoading) {
    return <PunchCardSkeleton />
  }

  const emptySlots = Math.max(0, TOTAL_SLOTS - positions.length);
  const emptyCards = Array(emptySlots).fill(null);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-4">
        {positions.map(({ symbol }) => (
          <Card key={symbol} className="rounded-xl overflow-hidden mb-1 mt-1">
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
            className="rounded-xl overflow-hidden mb-1 mt-1"
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