"use client";

import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import ChatFooter from "./ChatFooter";
import { Message } from "./FloatingChatbot";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export default function ChatPanel({ messages, onSendMessage, onClose }: ChatPanelProps) {
  return (
    <div
      className="fixed bg-white rounded-2xl shadow-xl flex flex-col animate-slideUp bottom-24 right-6 w-96 max-h-[400px] sm:bottom-20 sm:right-4 max-sm:w-[calc(100vw-32px)] max-sm:max-h-[360px] font-sans z-40 will-change-transform"
      style={{
        animation: 'slideUp 0.3s ease-out',
        fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <ChatHeader onClose={onClose} />
      <MessageArea messages={messages} />
      <ChatFooter onSendMessage={onSendMessage} />
    </div>
  );
}
