import React from 'react'
import { TAWidget } from '@/components/charts/ta-widget'
import { Card } from '@/components/ui/card'

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
    <div className="-m-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold">
          {decodedSymbol}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-12rem)] mt-4">
        {/* Technical Analysis Widget */}
        <Card className="h-full overflow-hidden">
          <div className="h-full w-full -m-3">
            <TAWidget 
              symbol={decodedSymbol}
              interval="1D"
              showIntervalTabs={true}
              displayMode="single"
              height="100%"
            />
          </div>
        </Card>

        {/* Additional widgets can go here */}
        <Card className="h-full overflow-hidden">
          <div className="h-full -m-3">
            {/* Future content */}
          </div>
        </Card>
      </div>
    </div>
  )
}