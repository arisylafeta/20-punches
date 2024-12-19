import { ChartConfig } from "@/components/ui/chart"

// Types for portfolio data
interface PortfolioHistoryEntry {
  date: Date
  totalValue: number
  positions: {
    symbol: string
    value: number
    quantity: number
  }[]
}

// Color palette for consistent visualization
export const colorPalette = {
  primary: "#2563eb",
  secondary: "#60a5fa",
  accent1: "#f59e0b",
  accent2: "#10b981",
  accent3: "#6366f1",
  accent4: "#ec4899",
  accent5: "#8b5cf6",
  neutral: "#94a3b8",
}

// Prepare data for the portfolio value line chart
export function prepareLineChartData(history: PortfolioHistoryEntry[]) {
  return history.map(entry => ({
    date: entry.date.toISOString().split('T')[0],
    value: Number(entry.totalValue.toFixed(2))
  }))
}

// Prepare data for the asset allocation pie chart
export function preparePieChartData(latestPositions: PortfolioHistoryEntry['positions']) {
  return latestPositions.map((position, index) => ({
    symbol: position.symbol,
    value: Number(position.value.toFixed(2)),
    fill: Object.values(colorPalette)[index % Object.keys(colorPalette).length]
  }))
}

// Prepare data for the position value bar chart
export function prepareBarChartData(history: PortfolioHistoryEntry[]) {
  return history.map(entry => {
    const data: any = {
      date: entry.date.toISOString().split('T')[0],
    }
    entry.positions.forEach(position => {
      data[position.symbol] = Number(position.value.toFixed(2))
    })
    return data
  })
}

// Chart configuration
export const chartConfig: ChartConfig = {
  value: {
    label: "Portfolio Value",
    color: colorPalette.primary,
  },
  // Dynamic symbol configs will be added based on portfolio positions
} as const

// Helper to generate chart config for symbols
export function generateSymbolConfig(symbols: string[]) {
  const config: any = { ...chartConfig }
  symbols.forEach((symbol, index) => {
    config[symbol] = {
      label: symbol,
      color: Object.values(colorPalette)[index % Object.keys(colorPalette).length],
    }
  })
  return config as ChartConfig
}