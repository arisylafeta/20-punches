'use client'

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"

interface TAWidgetProps {
  symbol?: string
  interval?: string
  showIntervalTabs?: boolean
  displayMode?: 'single' | 'regular'
}

export function TAWidget({
  symbol = "NASDAQ:AAPL",
  interval = "1m",
  showIntervalTabs = true,
  displayMode = "single"
}: TAWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme()
  const colorTheme = theme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    if (!container.current) return;
    
    const widgetContainer = container.current.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) return;

    // Clear any existing content
    widgetContainer.innerHTML = '';

    // Create a new container for the widget
    const scriptContainer = document.createElement('div');
    scriptContainer.className = 'tradingview-widget-container';
    
    // Create the widget container
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    scriptContainer.appendChild(widget);

    // Create and append the script
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval,
      width: "100%",
      height: "100%",
      isTransparent: false,
      symbol,
      showIntervalTabs,
      displayMode,
      locale: "en",
      colorTheme
    });

    // Replace the existing content with the new container
    widgetContainer.appendChild(scriptContainer);
    scriptContainer.appendChild(script);

    return () => {
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, colorTheme, interval, showIntervalTabs, displayMode]);

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="-m-1 h-[500px]">
        <div ref={container} className="h-full">
          <div className="tradingview-widget-container__widget h-full"></div>
        </div>
      </div>
    </Card>
  );
}
