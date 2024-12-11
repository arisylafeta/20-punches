'use client'

import { useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"

interface MiniChartProps {
  symbol?: string
  width?: string
  height?: string
  dateRange?: string
}

export function MiniChart({
  symbol = "FX:EURUSD",
  width = "100%",
  height = "100%",
  dateRange = "12M"
}: MiniChartProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme()
  const colorTheme = theme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) return;

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width,
      height,
      locale: "en",
      dateRange,
      colorTheme,
      isTransparent: false,
      autosize: true,
      largeChartUrl: ""
    });

    widgetContainer.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, width, height, colorTheme, dateRange]);

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