'use client';

import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { PreviewMessage, ThinkingMessage } from '@/components/chats/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import { Overview } from './overview';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useModel } from '@/contexts/model-context';

interface ChatProps {
  id: string;
  initialMessages: Array<Message>;
}

export default function Chat({ id, initialMessages }: ChatProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { selectedModel } = useModel();
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
    error,
  } = useChat({
    body: { id, modelId: selectedModel },
    initialMessages,
    onError: (error) => {
      if (error.message.includes('Daily message limit reached')) {
        toast({
          title: "Message Limit Reached",
          description: (
            <div className="flex flex-col space-y-2">
              <p>You have reached your daily limit of 10 messages.</p>
              <Link 
                href="/pricing" 
                className="text-primary hover:underline"
              >
                Upgrade to Premium for unlimited messages →
              </Link>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while sending your message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  useEffect(() => {
    if (streamingData) {
      console.log('Streaming data:', streamingData);
    }
  }, [streamingData]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-col min-w-0 bg-background h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6"
      >
        {messages.length === 0 && <Overview />}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
          />
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage />
        )}

        <div
          ref={messagesEndRef}
          className="h-0.5"
        />
      </div>

      <div className="border-t bg-background">
        <form 
          onSubmit={handleSubmit}
          className="flex max-w-3xl mx-auto p-4 gap-2"
        >
          <input
            className="flex-1 w-full p-2 border rounded-md"
            value={input}
            placeholder="Ask Warren Anything..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Send
          </button>
          {isLoading && (
            <button
              onClick={stop}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
            >
              Stop
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
