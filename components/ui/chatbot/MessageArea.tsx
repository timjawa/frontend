"use client";

import { useEffect, useRef } from "react";
import Message from "./Message";
import { Message as MessageType } from "./FloatingChatbot";

interface MessageAreaProps {
  messages: MessageType[];
}

export default function MessageArea({ messages }: MessageAreaProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      role="log"
      aria-live="polite"
      style={{ maxHeight: 'calc(400px - 140px)' }}
    >
      {messages.map((message) => (
        <Message
          key={message.id}
          content={message.content}
          sender={message.sender}
          timestamp={message.timestamp}
        />
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
