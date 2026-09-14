import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { inputStyle } from "./styles";

export function VoiceInput({ name, value, onChange, placeholder }) {
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    if (isListeningRef.current) return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Maaf, browser Anda tidak mendukung fitur suara.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { name, value: value ? value + " " + transcript : transcript } });
    };
    recognition.onerror = (ev) => {
      console.error(ev.error);
      isListeningRef.current = false;
      setIsListening(false);
    };
    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };
    recognition.start();
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: "3.5rem", border: "2px solid #d1d5db" }}
      />
      <button
        type="button"
        onClick={toggleListen}
        title="Gunakan Suara"
        style={{
          position: "absolute",
          right: "8px",
          background: isListening ? "#ef4444" : "var(--primary-color)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
    </div>
  );
}

export function VoiceTextarea({ name, value, onChange, placeholder, rows }) {
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    if (isListeningRef.current) return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Maaf, browser Anda tidak mendukung fitur suara.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { name, value: value ? value + " " + transcript : transcript } });
    };
    recognition.onerror = (ev) => {
      console.error(ev.error);
      isListeningRef.current = false;
      setIsListening(false);
    };
    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };
    recognition.start();
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputStyle, paddingRight: "3.5rem", resize: "vertical" }}
      />
      <button
        type="button"
        onClick={toggleListen}
        title="Gunakan Suara"
        style={{
          position: "absolute",
          right: "8px",
          bottom: "12px",
          background: isListening ? "#ef4444" : "var(--primary-color)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
    </div>
  );
}
