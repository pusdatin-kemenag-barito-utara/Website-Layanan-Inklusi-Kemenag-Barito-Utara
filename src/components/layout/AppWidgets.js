'use client';

import { usePathname } from 'next/navigation';
import AccessibilityWidget from "@/components/layout/AccessibilityWidget";
import LiveChatWidget from "@/components/layout/LiveChatWidget";
import Chatbot from "@/components/ui/Chatbot";

export default function AppWidgets() {
  const pathname = usePathname();

  // Sembunyikan semua floating widget jika sedang di halaman maintenance
  if (pathname === '/maintenance') {
    return null;
  }

  return (
    <>
      <AccessibilityWidget />
      <LiveChatWidget />
      <Chatbot />
    </>
  );
}
