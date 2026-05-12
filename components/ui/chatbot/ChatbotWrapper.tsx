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

  // Only render on landing page and public pages
  // Do not render on admin or auth pages
  const shouldRender = 
    pathname === "/" || // Landing page
    (pathname.startsWith("/") && 
     !pathname.startsWith("/admin") && 
     !pathname.startsWith("/login") && 
     !pathname.startsWith("/register"));

  if (!shouldRender) {
    return null;
  }

  return <FloatingChatbot />;
}
