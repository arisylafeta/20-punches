import { ChartDataPoint } from "./types"

/**
 * Calculates the volatility of returns over a given period.
 * This function attempts to adjust returns for net deposits/withdrawals.
 * Note: This is a simplified approach and not a true time-weighted return.
 * @param data Array of price data points
 * @param period Number of data points to consider for each return (1=daily, 7=weekly, etc.)
 * @returns Annualized volatility as a percentage
 */
export function calculateVolatility(data: ChartDataPoint[], period: number = 1): number {
  // Need at least period + 1 points to calculate returns
  const minDataPoints = period + 1;
  if (data.length < minDataPoints) {
    console.log('Not enough data for volatility calculation:', { dataLength: data.length, period });
    return 0;
  }

  // Calculate returns accounting for deposits
  const returns: number[] = [];
  for (let i = period; i < data.length; i++) {
    const currentPoint = data[i];
    const previousPoint = data[i - period];
    
    if (!currentPoint?.value || !previousPoint?.value || previousPoint.value === 0) {
      console.log('Invalid values found:', { current: currentPoint?.value, previous: previousPoint?.value, index: i });
      continue;
    }

    // Calculate net deposits during this period
    let netDeposits = 0;
    for (let j = i - period + 1; j <= i; j++) {
      netDeposits += data[j].deposit || 0;
    }

    // Calculate return excluding the effect of deposits
    const adjustedEndValue = currentPoint.value - netDeposits;
    const returnValue = (adjustedEndValue / previousPoint.value) - 1;

    // Filter out extreme values and invalid numbers
    if (isFinite(returnValue) && Math.abs(returnValue) < 0.5) { // Allow up to 50% changes
      returns.push(returnValue);
    } else {
      console.log('Filtered extreme return:', { 
        returnValue,
        current: currentPoint.value,
        previous: previousPoint.value,
        netDeposits,
        adjustedEndValue
      });
    }
  }

  if (returns.length < Math.max(2, Math.ceil(minDataPoints * 0.5))) {
    console.log('Not enough valid returns:', returns.length);
    return 0;
  }

  // Calculate mean return
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  
  // Calculate standard deviation using population formula
  const squaredDiffs = returns.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Annualize volatility based on period
  // For daily (period=1): √252
  // For weekly (period=7): √52
  // For monthly (period=30): √12
  const periodsPerYear = period === 1 ? 252 : period === 7 ? 52 : period === 30 ? 12 : 252/period;
  const annualFactor = Math.sqrt(periodsPerYear);
  const annualizedVolatility = stdDev * annualFactor * 100;

  console.log('Volatility calculation:', {
    mean,
    stdDev,
    annualizedVolatility,
    period,
    periodsPerYear,
    annualFactor,
    returnCount: returns.length,
    sampleReturns: returns.slice(0, 5)
  });

  return isFinite(annualizedVolatility) ? annualizedVolatility : 0;
}

/**
 * Calculates the Sharpe Ratio over a given period using geometric annualization of returns.
 * @param data Array of price data points
 * @param period Number of data points to consider (e.g., 90 for ~3 months)
 * @param riskFreeRate Annual risk-free rate (e.g., 0.04 for 4%)
 * @returns Sharpe Ratio
 */
export function calculateSharpeRatio(data: ChartDataPoint[], period: number = 90, riskFreeRate: number = 0.04): number {
  if (data.length < period) return 0;

  // Calculate total period return
  const periodReturn = (data[data.length - 1].value - data[data.length - period].value) / data[data.length - period].value;

  // Geometric annualization of returns (assuming 252 trading days per year)
  const annualizedReturn = Math.pow(1 + periodReturn, 252 / period) - 1;

  // Volatility calculation (converted from % to fraction)
  const volatility = calculateVolatility(data.slice(-period), 1) / 100;

  if (volatility === 0) return 0;

  // Sharpe Ratio
  return (annualizedReturn - riskFreeRate) / volatility;
}

/**
 * Calculates the Treynor Ratio over a given period.
 * Uses geometric annualization of returns and a simple beta estimation.
 * @param data Array of portfolio price data points
 * @param marketData Array of market benchmark price data points
 * @param period Number of data points to consider (e.g., 90 for ~3 months)
 * @param riskFreeRate Annual risk-free rate (e.g., 0.04 for 4%)
 * @returns Treynor Ratio
 */
export function calculateTreynorRatio(
  data: ChartDataPoint[],
  marketData: ChartDataPoint[],
  period: number = 90,
  riskFreeRate: number = 0.04
): number {
  if (data.length < period || marketData.length < period) return 0;

  const portfolioReturns: number[] = [];
  for (let i = 1; i < period; i++) {
    const returnValue = (data[i].value - data[i - 1].value) / data[i - 1].value;
    if (isFinite(returnValue)) portfolioReturns.push(returnValue);
  }

  const marketReturns: number[] = [];
  for (let i = 1; i < period; i++) {
    const returnValue = (marketData[i].value - marketData[i - 1].value) / marketData[i - 1].value;
    if (isFinite(returnValue)) marketReturns.push(returnValue);
  }

  if (portfolioReturns.length < 2 || marketReturns.length < 2) return 0;

  const portfolioMean = portfolioReturns.reduce((sum, val) => sum + val, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, val) => sum + val, 0) / marketReturns.length;

  let covariance = 0;
  let marketVariance = 0;
  for (let i = 0; i < portfolioReturns.length; i++) {
    covariance += (portfolioReturns[i] - portfolioMean) * (marketReturns[i] - marketMean);
    marketVariance += (marketReturns[i] - marketMean) ** 2;
  }

  covariance /= (portfolioReturns.length - 1);
  marketVariance /= (marketReturns.length - 1);

  const beta = covariance / marketVariance;
  if (!isFinite(beta) || beta === 0) return 0;

  // Total period return for portfolio
  const totalReturn = (data[data.length - 1].value - data[data.length - period].value) / data[data.length - period].value;
  const annualizedReturn = Math.pow(1 + totalReturn, 252 / period) - 1;

  // Treynor Ratio
  return (annualizedReturn - riskFreeRate) / beta;
}

/**
 * Formats the calculated metrics into a consistent structure.
 * @param data Portfolio price data
 * @param marketData Market benchmark data (e.g., S&P 500)
 * @returns Object containing all calculated metrics
 */
export function calculateMetrics(data: ChartDataPoint[], marketData: ChartDataPoint[]) {
  // Log initial data length
  console.log('Initial data length:', data.length);
  
  const dailyData = data.filter(point => point && typeof point.value === 'number' && point.value > 0);
  console.log('Daily data length after filtering:', dailyData.length);
  console.log('Sample daily data:', dailyData.slice(-5));

  const weeklyData = dailyData.slice(-7);
  console.log('Weekly data length:', weeklyData.length);
  console.log('Weekly data:', weeklyData);

  const threeMonthData = dailyData.slice(-90);
  console.log('3M data length:', threeMonthData.length);

  const sixMonthData = dailyData.slice(-180);
  console.log('6M data length:', sixMonthData.length);

  // Calculate and log volatilities
  const dailyVol = calculateVolatility(dailyData, 1);
  const weeklyVol = weeklyData.length >= 7 ? calculateVolatility(weeklyData, 7) : 0;
  
  console.log('Daily volatility:', dailyVol);
  console.log('Weekly volatility:', weeklyVol);

  // Calculate and log ratios
  const threeMonthSharpe = threeMonthData.length >= 90 ? calculateSharpeRatio(threeMonthData, 90) : 0;
  const sixMonthSharpe = sixMonthData.length >= 180 ? calculateSharpeRatio(sixMonthData, 180) : 0;
  
  console.log('3M Sharpe:', threeMonthSharpe);
  console.log('6M Sharpe:', sixMonthSharpe);

  return {
    volatility: {
      daily: dailyVol,
      weekly: weeklyVol
    },
    sharpeRatio: {
      threeMonth: threeMonthSharpe,
      sixMonth: sixMonthSharpe
    },
    treynorRatio: {
      threeMonth: (threeMonthData.length >= 90 && marketData.length >= 90) ? calculateTreynorRatio(threeMonthData, marketData.slice(-90), 90) : 0,
      sixMonth: (sixMonthData.length >= 180 && marketData.length >= 180) ? calculateTreynorRatio(sixMonthData, marketData.slice(-180), 180) : 0
    }
  };
}
