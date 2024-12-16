import React from 'react'
import { TAWidget } from '@/components/charts/ta-widget'
import SymbolChart from '@/components/charts/symbol-chart'
import SymbolFinancials from '@/components/charts/symbol-financials'
import SymbolProfile from '@/components/charts/symbol-profile'

interface PageProps {
  params: {
    symbol: string
  }
  searchParams: {
    theme?: string
  }
}

export default function SymbolPage({ params, searchParams }: PageProps) {
  const decodedSymbol = decodeURIComponent(params.symbol)
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <SymbolChart 
            symbol={decodedSymbol}
          />
        </div>
        <div className="col-span-1">
          <SymbolProfile 
            symbol={decodedSymbol}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <SymbolFinancials 
            symbol={decodedSymbol}
          />
        </div>
        <div className="col-span-1">
          <TAWidget 
            symbol={decodedSymbol}
            interval="1D"
            showIntervalTabs={true}
            displayMode="single"
          />
        </div>
      </div>
    </div>
  )
}