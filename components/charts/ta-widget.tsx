'use client'

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface TAWidgetProps {
  symbol?: string
  width?: string
  height?: string
  interval?: string
  showIntervalTabs?: boolean
  displayMode?: 'single' | 'regular'
}

export function TAWidget({
  symbol = "NASDAQ:AAPL",
  width = "100%",
  height = "100%",
  interval = "1m",
  showIntervalTabs = true,
  displayMode = "single"
}: TAWidgetProps) {
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
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        interval,
        width,
        height,
        isTransparent: false,
        symbol,
        showIntervalTabs,
        displayMode,
        locale: "en",
        colorTheme
      });

      widgetContainer.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, width, height, colorTheme, interval, showIntervalTabs, displayMode]);

  // Use theme in key to force remount on theme change
  return (
    <div className="relative h-full" ref={containerRef} key={colorTheme}>
      <div className="tradingview-widget-container h-full">
        <div className="tradingview-widget-container__widget h-full"></div>
        <div className="tradingview-widget-copyright">
          <a 
            href="https://www.tradingview.com/" 
            rel="noopener nofollow" 
            target="_blank"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Track all markets on TradingView
          </a>
        </div>
      </div>
    </div>
  );
}
