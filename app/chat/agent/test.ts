import { buffetGraph } from './graph';
import { State } from '../../lib/utils/types';

async function testBuffetGraph() {
    // Create initial state
    const initialState: State = {
        messages: [
            {
                role: "user",
                content: "What are your thoughts on Apple's current financial state?"
            }
        ]
    };

    console.log("\nTesting Buffet Graph...");
    console.log("Initial Question:", initialState.messages[0].content);
    
    try {
        const finalState = await buffetGraph.invoke(initialState);
        
        console.log("\nGraph Execution Results:");
        console.log("--------------------------------");
        console.log("Routing Decision:", finalState.routingDecision);
        console.log("Tickers:", finalState.tickers);
        console.log("Financial Summary:", finalState.financialSummary);
        console.log("Investment Philosophy:", finalState.summarizedDocs);
        console.log("\nBuffet's Final Response:");
        console.log(finalState.messages[finalState.messages.length - 1].content);
    } catch (error) {
        console.error("Error in graph execution:", error);
    }
}

// Run the test
testBuffetGraph();