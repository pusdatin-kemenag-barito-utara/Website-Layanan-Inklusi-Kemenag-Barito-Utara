import React from "react";
import AccessibilityProvider from "./AccessibilityProvider";
import AccessibilityWidget from "./AccessibilityWidget";
import LiveChatWidget from "./LiveChatWidget";
import Chatbot from "./Chatbot";

export default function AppWidgets() {
  return (
    <AccessibilityProvider>
      <AccessibilityWidget />
      <LiveChatWidget />
      <Chatbot />
    </AccessibilityProvider>
  );
}
