// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  watchlist?: string[];
  symbol?: string;
  showWatchlist?: boolean;
  height?: number;
}

function TradingViewWidget({ 
  watchlist = [], 
  symbol, 
  showWatchlist = true,
  height = 600
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const currentContainer = container.current;
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol || watchlist[0] || "SPY",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        withdateranges: true,
        allow_symbol_change: true,
        ...(showWatchlist && { watchlist }),
        calendar: false,
        support_host: "https://www.tradingview.com"
      });
      
      if (currentContainer) {
        currentContainer.appendChild(script);
      }

      return () => {
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
      };
    },
    [watchlist, symbol, showWatchlist]
  );

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: "100%", minHeight: height }}>
      <div className="tradingview-widget-container__widget" style={{ height: height, width: "100%" }}></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
    </div>
  );
}

export default memo(TradingViewWidget);
