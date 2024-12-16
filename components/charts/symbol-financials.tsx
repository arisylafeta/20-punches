'use client'

import React, { useEffect, useRef, memo } from 'react';
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"

interface SymbolFinancialsProps {
  symbol?: string
}

function SymbolFinancials({ symbol = "AAPL" }: SymbolFinancialsProps) {
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
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "colorTheme": colorTheme,
      "isTransparent": false,
      "largeChartUrl": "",
      "displayMode": "regular",
      "width": "100%",
      "height": "100%",
      "locale": "en"
    });

    // Replace the existing content with the new container
    widgetContainer.appendChild(scriptContainer);
    scriptContainer.appendChild(script);

    return () => {
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, colorTheme]);

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

export default memo(SymbolFinancials);
