import { StringOutputParser } from "@langchain/core/output_parsers";
import { State } from "@/utils/types";
import { getModel } from "@/utils/models";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate} from "@langchain/core/prompts";

// Base system prompt that defines Warren's core personality
const BUFFETT_SYSTEM_TEMPLATE = `You are Warren Buffett, the legendary investor and CEO of Berkshire Hathaway. Your communication style is:
- Folksy and down-to-earth, using simple language and relatable analogies
- Patient and long-term oriented in your thinking
- Humble yet confident, drawing from decades of experience
- Known for your wit and self-deprecating humor
- Practical and focused on fundamental business principles

Core Traits:
- Value investing advocate
- Focus on business fundamentals and intrinsic value
- Emphasis on long-term thinking
- Skeptical of speculation and complex financial instruments
- Known for clear, simple communication`;

// Conversational prompt for casual interactions
const CONVERSATIONAL_TEMPLATE = `
{system_prompt}

You're having a casual conversation. Keep your response natural, brief, and engaging.
Feel free to use humor and personal anecdotes where appropriate.

Recent conversation:
{message_history}

Current question: {current_question}
`;

// Detailed prompt for investment-related discussions
const DETAILED_TEMPLATE = `
{system_prompt}

You're providing investment advice and analysis. Be thorough while maintaining your approachable style.
Draw from the provided financial data and investment principles to support your response.

Recent conversation:
{message_history}

Investment Philosophy:
{investment_docs}

Financial Analysis:
{financial_summary}

Current question: {current_question}

Provide a comprehensive response that incorporates both the financial analysis and your investment principles. Cite statistics in your arguments.
`;

const formatMessageHistory = (messages: BaseMessage[]): string => {
    const relevantHistory = messages.slice(-3);
    return relevantHistory.slice(0, -1).map(m => m.content).join('\n');
};

export const buffetAgent = async (state: State) => {
    const messages = state.messages;
    const messageHistory = formatMessageHistory(messages);
    const currentQuestion = messages[messages.length - 1].content;

    const summarizedDocs = state.summarizedDocs;
    const financialSummary = state.financialHistory ?? '';
    const routingDecision = state.routingDecision;

    // Get the model from utils
    const llm = getModel('SMALL');
    const strOutputParser = new StringOutputParser();

    // Create prompt templates
    const conversationalPrompt = ChatPromptTemplate.fromTemplate(CONVERSATIONAL_TEMPLATE);
    const detailedPrompt = ChatPromptTemplate.fromTemplate(DETAILED_TEMPLATE);

    // Base parameters that both templates use
    const baseParams = {
        system_prompt: BUFFETT_SYSTEM_TEMPLATE,
        message_history: messageHistory,
        current_question: currentQuestion
    };

    // Create the chain with conditional prompt selection
    const buffetbot = RunnableSequence.from([
        async () => {
            if (routingDecision === 'conversational') {
                return await conversationalPrompt.format(baseParams);
            } else {
                return await detailedPrompt.format({
                    ...baseParams,
                    financial_summary: financialSummary,
                    investment_docs: summarizedDocs
                });
            }
        },
        llm,
        strOutputParser
    ]);

    // Generate response
    const response = await buffetbot.invoke({});
    
    return { messages: [new AIMessage(response)] };
};
