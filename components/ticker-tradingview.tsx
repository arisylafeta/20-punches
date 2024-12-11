'use client'

import { useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"

interface TradingViewTickerProps {
  symbol?: string
  width?: string
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

    // Clear all content of the widget container
    widgetContainer.innerHTML = '';

    // Small delay to ensure cleanup is complete
    const timeoutId = setTimeout(() => {
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
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, width, colorTheme]);

  // Use theme in key to force remount on theme change
  return (
    <div className="relative group" ref={containerRef} key={colorTheme}>
      <div 
        className="absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-muted/20" 
        onClick={() => router.push(`/dashboard/${encodeURIComponent(symbol)}?theme=${colorTheme}`)}
      />
      <div className="tradingview-widget-container z-0">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
