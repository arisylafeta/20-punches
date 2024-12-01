"use client";

import { useState } from "react";
import { runAgent } from "./action";
import { readStreamableValue } from "ai/rsc";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { MessageContent, MessageContentText } from "@langchain/core/messages";

function renderMessageContent(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => (item as MessageContentText).text)
      .join(' ');
  }
  return '';
}

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input) return;
    
    setIsLoading(true);
    const userMessage = new HumanMessage({ content: input });
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const { streamData } = await runAgent(input);
      for await (const item of readStreamableValue(streamData)) {
        if (item.event === "llm") {
          const assistantMessage = new AIMessage({ 
            content: JSON.stringify(item.data, null, 2)
          });
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = new AIMessage({
        content: "Sorry, an error occurred while processing your message."
      });
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-12 flex flex-col gap-4">
      <div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4 bg-sky-50 rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-2 ${
              msg._getType() === "human" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded-lg p-4 max-w-[80%] ${
                msg._getType() === "human"
                  ? "bg-sky-600 text-white"
                  : "bg-white text-black border border-sky-200"
              }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Warren Buffett anything..."
          className="flex-1 rounded-lg border border-gray-200 p-4"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-8 text-white disabled:opacity-50"
          disabled={isLoading || !input}
        >
          Send
        </button>
      </form>
    </div>
  );
}