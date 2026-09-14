import React, { createContext, useContext, useState, useEffect } from "react";

const defaultAccessibility = {
  fontSizeMultiplier: 1,
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
  isHighContrast: false,
  toggleHighContrast: () => {},
  isDyslexiaFont: false,
  toggleDyslexiaFont: () => {},
  isSpeaking: false,
  speakText: () => {},
  stopSpeaking: () => {},
};

const AccessibilityContext = createContext(defaultAccessibility);

export const useAccessibility = () => useContext(AccessibilityContext) || defaultAccessibility;

export default function AccessibilityProvider({ children }) {
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-size-multiplier", fontSizeMultiplier);

    if (isHighContrast) root.setAttribute("data-theme", "high-contrast");
    else root.removeAttribute("data-theme");

    if (isDyslexiaFont) root.classList.add("dyslexia-font");
    else root.classList.remove("dyslexia-font");
  }, [fontSizeMultiplier, isHighContrast, isDyslexiaFont]);

  const increaseFontSize = () =>
    setFontSizeMultiplier((prev) => Math.min(prev + 0.1, 1.5));
  const decreaseFontSize = () =>
    setFontSizeMultiplier((prev) => Math.max(prev - 0.1, 0.8));
  const resetFontSize = () => setFontSizeMultiplier(1);
  const toggleHighContrast = () => setIsHighContrast((v) => !v);
  const toggleDyslexiaFont = () => setIsDyslexiaFont((v) => !v);

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeMultiplier,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        isHighContrast,
        toggleHighContrast,
        isDyslexiaFont,
        toggleDyslexiaFont,
        isSpeaking,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
