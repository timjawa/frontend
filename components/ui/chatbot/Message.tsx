"use client";

import { Message as MessageType } from "./FloatingChatbot";

interface MessageProps {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Message({ content, sender, timestamp }: MessageProps) {
  const isUser = sender === 'user';
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`
          max-w-[80%] p-3 rounded-2xl text-sm break-words
          ${isUser 
            ? 'bg-[#3B82F6] text-white ml-auto' 
            : 'bg-[#E8F4FD] text-[#1f2a56] mr-auto'
          }
        `}
      >
        {content}
      </div>
    </div>
  );
}
