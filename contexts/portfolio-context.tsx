'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface PortfolioContextType {
  triggerRefresh: () => void
  lastUpdate: number
}

const PortfolioContext = createContext<PortfolioContextType>({
  triggerRefresh: () => {},
  lastUpdate: Date.now()
})

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const triggerRefresh = useCallback(() => {
    setLastUpdate(Date.now())
  }, [])

  return (
    <PortfolioContext.Provider value={{ triggerRefresh, lastUpdate }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  return useContext(PortfolioContext)
}
