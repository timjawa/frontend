"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load FloatingChatbot for performance
const FloatingChatbot = dynamic(() => import("./FloatingChatbot"), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotWrapper() {
  const pathname = usePathname();

  // Only render on landing page (beranda)
  const shouldRender = pathname === "/";


  if (!shouldRender) {
    return null;
  }

  return <FloatingChatbot />;
}
