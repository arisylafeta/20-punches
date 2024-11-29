import { retrieveDocs } from './retriever';
import { extractTickers } from './ticker_extractor';
import { getFinancialRatios } from './tools';
import { executeFinancialAnalysis } from './financial_analyst';
import { State } from './types';

async function testRetrieval() {
    const initialState: State = {
        messages: [{
            role: "user",
            content: "What are Warren Buffett's principles for value investing?"
        }],
        tickers: []
    };

    try {
        console.log("\nTesting Document Retrieval...");
        console.log("Initial question:", initialState.messages[0].content);
        const updatedState = await retrieveDocs(initialState);
        
        console.log("\nRetrieved and Summarized Documents:");
        console.log("--------------------------------");
        console.log(updatedState.summarized_docs);
    } catch (error) {
        console.error("Error in retriever test:", error);
    }
}

async function testTickerExtraction() {
    const testCases: State[] = [
        {
            messages: [{
                role: "user",
                content: "What's the latest news about Apple and Microsoft?"
            }],
            tickers: []
        },
        {
            messages: [{
                role: "user",
                content: "How is Tesla's stock performing compared to other EV manufacturers?"
            }],
            tickers: []
        },
        {
            messages: [{
                role: "user",
                content: "What are some good dividend stocks to invest in?"
            }],
            tickers: []
        }
    ];

    console.log("\nTesting Ticker Extraction...");
    console.log("--------------------------------");

    for (const testCase of testCases) {
        try {
            console.log("\nInput:", testCase.messages[0].content);
            const result = await extractTickers(testCase);
            console.log("Extracted Tickers:", result.tickers);
        } catch (error) {
            console.error("Error in ticker extraction:", error);
        }
    }
}

async function testFinancialRatiosAndAnalysis() {
    console.log("Starting tests...\n");

    // Test 1: Get Financial Ratios
    console.log("\nTesting Financial Ratios Tool...");
    console.log("--------------------------------");
    try {
        const ratios = await getFinancialRatios.call("AAPL");
        console.log("Successfully retrieved financial ratios for AAPL:");
        console.log(ratios);
    } catch (error) {
        console.error("Error getting financial ratios:", error);
    }

    // Test 2: Financial Analysis
    console.log("\nTesting Financial Analysis...");
    console.log("--------------------------------");
    
    const testCases = [
        {
            message: "What are Apple's current financial metrics and would Warren Buffett consider it a good investment?",
            expectedTicker: "AAPL"
        },
        {
            message: "Is Tesla financially healthy based on its ratios?",
            expectedTicker: "TSLA"
        }
    ];

    for (const testCase of testCases) {
        console.log(`\nAnalyzing: ${testCase.message}`);
        
        // First extract tickers
        const state = {
            messages: [{ content: testCase.message, role: "user" }],
            tickers: []
        };
        
        const stateWithTickers = await extractTickers(state);
        console.log("Extracted tickers:", stateWithTickers.tickers);

        // Then run financial analysis
        try {
            const analysisResult = await executeFinancialAnalysis(stateWithTickers);
            console.log("\nAnalysis Result:");
            console.log(analysisResult.financial_summary);
        } catch (error) {
            console.error("Error in financial analysis:", error);
        }
    }
}

async function main() {
    console.log("Starting tests...\n");
    
    // Test ticker extraction
    await testTickerExtraction();
    
    // Test financial ratios and analysis
    await testFinancialRatiosAndAnalysis();
}

main();
