"use client";

import { useState, useEffect, useRef } from "react";
import ToggleButton from "./ToggleButton";
import ChatPanel from "./ChatPanel";

// ============================================================================
// Type Definitions
// ============================================================================

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// ============================================================================
// Example Conversation Data
// ============================================================================

export const EXAMPLE_MESSAGES: Message[] = [
  {
    id: 'example-1',
    content: 'Halo! Saya adalah asisten Jember Siaga. Bagaimana saya bisa membantu Anda hari ini?',
    sender: 'bot',
    timestamp: new Date(),
  },
  {
    id: 'example-2',
    content: 'Bagaimana prakiraan cuaca untuk besok?',
    sender: 'user',
    timestamp: new Date(),
  },
  {
    id: 'example-3',
    content: 'Berdasarkan data BMKG, besok diprediksi cerah berawan dengan suhu 27-32°C. Kemungkinan hujan ringan pada sore hari di wilayah selatan Jember.',
    sender: 'bot',
    timestamp: new Date(),
  },
  {
    id: 'example-4',
    content: 'Apa yang harus saya lakukan jika terjadi banjir?',
    sender: 'user',
    timestamp: new Date(),
  },
  {
    id: 'example-5',
    content: 'Jika terjadi banjir: 1) Segera pindah ke tempat yang lebih tinggi, 2) Matikan listrik dan gas, 3) Bawa dokumen penting, 4) Hubungi nomor darurat 112, 5) Ikuti instruksi dari petugas.',
    sender: 'bot',
    timestamp: new Date(),
  },
  {
    id: 'example-6',
    content: 'Dimana saya bisa melihat peta rawan bencana?',
    sender: 'user',
    timestamp: new Date(),
  },
  {
    id: 'example-7',
    content: 'Anda dapat melihat peta rawan bencana di halaman Peta pada menu navigasi. Peta tersebut menampilkan zona rawan banjir, longsor, dan bencana lainnya di Kabupaten Jember.',
    sender: 'bot',
    timestamp: new Date(),
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Toggle widget open/closed state
  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  // Initialize example conversation on first open
  useEffect(() => {
    if (isOpen && isFirstOpen) {
      setMessages(EXAMPLE_MESSAGES);
      setIsFirstOpen(false);
    }
  }, [isOpen, isFirstOpen]);

  // Handle Escape key to close widget
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <>
      <ToggleButton 
        ref={toggleButtonRef}
        isOpen={isOpen} 
        onClick={toggleWidget} 
      />
      {isOpen && (
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={toggleWidget}
        />
      )}
    </>
  );
}
