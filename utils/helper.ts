import { FinancialEntry } from './types';
import { BaseMessage } from '@langchain/core/messages';

// Helper function to format financial history
export function formatFinancialHistory(entries: FinancialEntry[], separator: string = '==================') {
    if (!entries || entries.length === 0) {
        return 'No financial history available.';
    }

    return entries.map(entry => {
        // For metrics that are already in bullet point format, we don't want to add another bullet
        const metricsLines = entry.relevantMetrics
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.startsWith('- ') ? line : `- ${line}`);

        return `${entry.ticker} (${entry.timestamp}):\n${metricsLines.join('\n')}`;
    }).join(`\n${separator}\n\n`); // Added extra newline after separator for better readability
}


// Helper function to parse financial history
export function parseFinancialHistory(formattedText: string, separator: string = '=================='): FinancialEntry[] {
    // Split the text into sections using the separator
    const sections = formattedText.split(separator)
        .map(section => section.trim())
        .filter(section => section.length > 0);

    return sections.map(section => {
        // First line should be "TICKER (timestamp):"
        const [headerLine, ...metricLines] = section.split('\n').map(line => line.trim());
        
        // Extract ticker and timestamp from header
        const match = headerLine.match(/^([A-Z]+)\s*\(([^)]+)\):/);
        if (!match) {
            throw new Error(`Invalid header format in section: ${headerLine}`);
        }
        
        const [, ticker, timestamp] = match;

        // Process metrics lines
        const relevantMetrics = metricLines
            .filter(line => line.startsWith('- '))
            .map(line => line.substring(2)) // Remove "- " prefix
            .join('\n');

        return {
            ticker,
            timestamp,
            relevantMetrics
        };
    });
}


// Helper
export const formatMessageHistory = (messages: BaseMessage[]): string => {
    const relevantHistory = messages.slice(-3);
    return relevantHistory.slice(0, -1).map(m => m.content).join('\n');
};



export const getURL = (path: string = '') => {
    // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL &&
            process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
            ? process.env.NEXT_PUBLIC_SITE_URL
            : // If not set, check for NEXT_PUBLIC_VERCEL_URL, which is automatically set by Vercel.
            process?.env?.NEXT_PUBLIC_VERCEL_URL &&
                process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
                ? process.env.NEXT_PUBLIC_VERCEL_URL
                : // If neither is set, default to localhost for local development.
                'http://localhost:3000/';

    // Trim the URL and remove trailing slash if exists.
    url = url.replace(/\/+$/, '');
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;
    // Ensure path starts without a slash to avoid double slashes in the final URL.
    path = path.replace(/^\/+/, '');

    // Concatenate the URL and the path.
    return path ? `${url}/${path}` : url;
};
