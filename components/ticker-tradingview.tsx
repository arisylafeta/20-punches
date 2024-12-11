'use client'

import { useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"

interface TradingViewTickerProps {
  symbol?: string
  width?: string
  colorTheme?: 'light' | 'dark'
}

export function TradingViewTicker({
  symbol = "FX:EURUSD",
  width = "100%",
}: TradingViewTickerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme()
  const colorTheme = theme === 'dark' ? 'dark' : 'light'

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
      colorTheme,
      isTransparent: false,
      locale: "en"
    });

    widgetContainer.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, width, colorTheme]);

  return (
    <div className="relative group" ref={containerRef}>
      <div 
        className="absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-muted/20" 
        onClick={() => router.push(`/dashboard/${encodeURIComponent(symbol)}?theme=${colorTheme}`)}
      />
      <div className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
