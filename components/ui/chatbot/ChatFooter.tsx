"use client";

import { useState, KeyboardEvent } from "react";
import InputField from "./InputField";
import SendButton from "./SendButton";

interface ChatFooterProps {
  onSendMessage: (message: string) => void;
}

export default function ChatFooter({ onSendMessage }: ChatFooterProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Allow Shift+Enter for newline (default textarea behavior)
  };

  const isSendDisabled = inputValue.trim().length === 0;

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex gap-2 items-end">
        <InputField
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={isSendDisabled}
        />
      </div>
    </div>
  );
}
