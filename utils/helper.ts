import { FinancialEntry } from './types';

/**
 * Formats financial history entries into a structured markdown string
 * @param entries Array of FinancialEntry objects to format
 * @param separator Optional separator between entries (defaults to '==================')
 * @returns Formatted markdown string
 */
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

/**
 * Parses a formatted financial history string back into an array of FinancialEntry objects
 * @param formattedText The formatted text to parse (must start with separator)
 * @param separator Optional separator between entries (defaults to '==================')
 * @returns Array of FinancialEntry objects
 */
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
