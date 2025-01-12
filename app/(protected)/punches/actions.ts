export const stockList = [
    "AAPL",  // Apple
    "MSFT",  // Microsoft
    "GOOGL", // Alphabet
    "TSLA",  // Tesla
    "JPM",   // JPMorgan Chase
    "V",     // Visa
    "WMT",   // Walmart
    "PG",    // Procter & Gamble
    "KO",    // Coca-Cola
    "DIS",   // Disney
    "NFLX",  // Netflix
    "ADBE",  // Adobe
    "PYPL",  // PayPal
    "INTC",  // Intel
    "AMD",   // Advanced Micro Devices
    "CRM",   // Salesforce
    "BA"     // Boeing
] as const;

export type Stock = typeof stockList[number];