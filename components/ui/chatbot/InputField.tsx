"use client";

import { ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export default function InputField({ 
  value, 
  onChange, 
  onKeyDown,
  placeholder = "Ketik pesan Anda..." 
}: InputFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 4 lines (96px)
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    onChange(target.value);
    
    // Reset height to auto to get the correct scrollHeight
    target.style.height = 'auto';
    // Set height to scrollHeight, but max 96px (4 lines)
    target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
  };

  // Reset height when value is cleared
  useEffect(() => {
    if (value === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleInput}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label="Ketik pesan Anda"
      rows={1}
      className="flex-1 p-3 text-sm rounded-xl resize-none border border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none transition-colors duration-200"
      style={{ minHeight: '44px' }}
    />
  );
}
