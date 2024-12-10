import React from 'react'

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Symbol Details: {decodedSymbol}
      </h1>
      <p>Theme: {searchParams.theme}</p>
      {/* You can use params.symbol and searchParams here */}
    </div>
  )
}