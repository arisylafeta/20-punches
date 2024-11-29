import { Tool } from "@langchain/core/tools";
import { Document } from "@langchain/core/documents";

// Helper functions
const cleanTicker = (ticker: string): string => {
  return ticker.trim().toUpperCase();
};

// Document formatting helper
export const formatDocs = (docs: Document[]): string => {
    return docs.map(doc => doc.pageContent).join("\n\n");
  };

class GetFinancialKeyMetricsTool extends Tool {
  name = "get_financial_key_metrics";
  description = "Retrieve all financial key metrics for a specified company. Input should be a stock ticker symbol (e.g., 'AAPL' for Apple Inc.)";

  protected async _call(ticker: string): Promise<string> {
    const cleanedTicker = cleanTicker(ticker);
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/key-metrics/${cleanedTicker}?apikey=${apiKey}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      
      let result = "";
      for (const item of jsonData) {
        result += "========================\n";
        for (const [key, value] of Object.entries(item)) {
          result += `${key}: ${value}\n`;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      throw new Error(`Failed to get financial metrics for ${cleanedTicker}`);
    }
  }
}

class GetFinancialRatiosTool extends Tool {
  name = "get_financial_ratios";
  description = "Retrieve all financial ratios for a specified company. Input should be a stock ticker symbol (e.g., 'AAPL' for Apple Inc.)";

  protected async _call(ticker: string): Promise<string> {
    const cleanedTicker = cleanTicker(ticker);
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/ratios/${cleanedTicker}?&apikey=${apiKey}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      
      let result = "";
      for (const item of jsonData) {
        result += "========================\n";
        for (const [key, value] of Object.entries(item)) {
          result += `${key}: ${value}\n`;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching financial ratios:', error);
      throw new Error(`Failed to get financial ratios for ${cleanedTicker}`);
    }
  }
}

// Initialize tools
export const tools = [
  new GetFinancialKeyMetricsTool(),
  new GetFinancialRatiosTool()
];

// Export individual tools if needed
export const getFinancialKeyMetrics = new GetFinancialKeyMetricsTool();
export const getFinancialRatios = new GetFinancialRatiosTool();