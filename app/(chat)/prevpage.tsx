"use client";

import { useState } from "react";
import { runAgent } from "./action";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input) return;
    
    setIsLoading(true);
    setInput("");

    try {
      const response = await runAgent(input);
      setMessages(response.response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-12 flex flex-col gap-4">
      <div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4 bg-sky-50 rounded-lg">
        {messages.map((msg, i) => (
          <ChatMessageBubble
            key={i}
            message={{
              role: msg.role,
              content: msg.content,
              id: i.toString()
            }}
            aiEmoji="🎩"
            sources={[]}
          />
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