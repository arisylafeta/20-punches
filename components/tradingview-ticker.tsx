'use client'

import { useEffect, useRef } from "react"

interface TradingViewTickerProps {
  symbol?: string
  width?: string
  colorTheme?: 'light' | 'dark'
}

export function TradingViewTicker({
  symbol = "FX:EURUSD",
  width = "100%",
  colorTheme = "dark"
}: TradingViewTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) return;

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width,
      isTransparent: false,
      colorTheme,
      locale: "en",
      largeChartUrl: `https://20-punches.vercel.app/${symbol}`
    });

    widgetContainer.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, width, colorTheme]);

  return (
    <div ref={containerRef} className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}
