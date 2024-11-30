"use client";

import { useState } from "react";
import { runAgent } from "./action";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { readStreamableValue } from "ai/rsc";
import { Message } from "@/app/lib/utils/types";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input) return;
    
    setIsLoading(true);
    const userMessage: Message = { content: input, role: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const { streamData } = await runAgent(input);
      for await (const item of readStreamableValue(streamData)) {
        if (item.event === "llm") {
          const assistantMessage: Message = {
            content: JSON.stringify(item.data, null, 2),
            role: "assistant"
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        content: "Sorry, an error occurred while processing your message.",
        role: "assistant"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-12 flex flex-col gap-4">
      <div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              msg.role === "user" ? "bg-blue-100 ml-auto" : "bg-black"
            } max-w-[80%]`}
          >
            <div className="font-semibold mb-1">
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}