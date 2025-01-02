
import { ChartDataPoint } from "./types";

/**
 * Helper function: Calculate daily returns from consecutive ChartDataPoints
 */
function calculateReturns(data: ChartDataPoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const currentValue = data[i].value;
    const previousValue = data[i - 1].value;
    
    if (
      typeof currentValue === 'number' && 
      typeof previousValue === 'number' && 
      previousValue !== 0
    ) {
      // Daily return = (current - previous) / previous
      returns.push((currentValue - previousValue) / previousValue);
    }
  }
  return returns;
}

/**
 * Main function to calculate:
 *  - Daily volatility (std dev)
 *  - Weekly volatility (approx)
 *  - 3-month Sharpe Ratio
 *  - 6-month Sharpe Ratio
 */
function calculateMetrics(data: ChartDataPoint[]) {
  console.log('Starting metrics calculation');
  console.log(`Raw data length: ${data.length}`);
  
  // 1) Filter out invalid data points
  const dailyData = data.filter(
    (point) => point && typeof point.value === 'number' && point.value > 0
  );
  console.log(`Filtered daily data length: ${dailyData.length}`);

  // 2) Calculate the series of daily returns
  const returns = calculateReturns(dailyData);
  if (returns.length === 0) {
    return {
      volatility: { daily: 0, weekly: 0 },
      sharpeRatio: { threeMonth: 'No data', sixMonth: 'No data' }
    };
  }

  // 3) Compute mean daily return
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // 4) Compute daily volatility (standard deviation)
  const squaredDiffs = returns.map(r => Math.pow(r - meanReturn, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (returns.length - 1);
  const dailyVol = Math.sqrt(variance);

  // 5) Calculate a simple daily->weekly volatility for reference
  const weeklyVol = dailyVol * Math.sqrt(5);

  // 6) Calculate Sharpe Ratios for 3M and 6M
  //    Example risk-free rate = 4% (annual)
  const ANNUAL_RISK_FREE_RATE = 0.04;
  const data_size = dailyData.length;
  const threeMonthSharpe = data_size > 63 ? calculateSharpeRatio(returns, ANNUAL_RISK_FREE_RATE, '3M') : 'No data';
  const sixMonthSharpe = data_size > 126 ? calculateSharpeRatio(returns, ANNUAL_RISK_FREE_RATE, '6M') : 'No data';

  // 7) Return final metrics
  return {
    volatility: {
      daily: dailyVol * 100,     // daily vol in percentage
      weekly: weeklyVol * 100,   // weekly vol in percentage
    },
    sharpeRatio: {
      threeMonth: threeMonthSharpe,
      sixMonth: sixMonthSharpe
    }
  };
}


type SharpeTimePeriod = '3M' | '6M';

function calculateSharpeRatio(
  allDailyReturns: number[],
  annualRiskFreeRate: number,
  timePeriod: SharpeTimePeriod
): string | number {
  let requiredDays = 0;

  if (timePeriod === '3M') {
    requiredDays = 63;  // ~3 months of trading days
  } else {
    requiredDays = 126; // ~6 months of trading days
  }

  // Check data length
  if (allDailyReturns.length < requiredDays) {
    return 'No data';
  }

  // Slice the last N days from the entire series
  const slicedReturns = allDailyReturns.slice(allDailyReturns.length - requiredDays);

  // Calculate daily mean for that sub-period
  const meanDailyReturn = slicedReturns.reduce((sum, r) => sum + r, 0) / slicedReturns.length;

  // Calculate daily volatility (std dev) for that sub-period
  const squaredDiffs = slicedReturns.map(r => Math.pow(r - meanDailyReturn, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (slicedReturns.length - 1);
  const dailyStd = Math.sqrt(variance);

  // Annualize daily return: (1 + meanDailyReturn)^252 - 1
  const annualizedReturn = Math.pow(1 + meanDailyReturn, 252) - 1;

  // Annualize daily volatility: dailyStd * sqrt(252)
  const annualizedVol = dailyStd * Math.sqrt(252);

  // Compute Sharpe Ratio = (annualizedReturn - riskFreeRate) / annualizedVol
  const excessReturn = annualizedReturn - annualRiskFreeRate;

  if (annualizedVol === 0) {
    return 0; // or "No data" if you'd prefer
  }

  return excessReturn / annualizedVol;
}

// --------------------------------------------------------------------
// Exports
// --------------------------------------------------------------------
export {
  calculateReturns,
  calculateMetrics,
  calculateSharpeRatio
};
