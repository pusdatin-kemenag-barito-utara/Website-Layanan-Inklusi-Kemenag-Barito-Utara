import React, { useState } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo! Saya Asisten Virtual Inklusi Kemenag Barito Utara. Ada yang bisa saya bantu terkait layanan haji, nikah, atau madrasah?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      let botResponse = "Maaf, saya masih dalam tahap pengembangan. Namun, Anda bisa menghubungi nomor WhatsApp PTSP kami di +62 851-1749-1212 untuk informasi lebih lanjut.";
      const lowerInput = newMsg.text.toLowerCase();
      if (lowerInput.includes("haji")) {
        botResponse = "Untuk pendaftaran haji khusus lansia atau disabilitas, Anda bisa datang langsung ke PTSP Kemenag atau menggunakan fitur Antrean Prioritas di web ini.";
      } else if (lowerInput.includes("nikah")) {
        botResponse = "Syarat nikah meliputi N1, N2, N3 dari kelurahan, fotokopi KTP, dan pas foto. Kantor KUA Barito Utara telah dilengkapi fasilitas aksesibel.";
      }
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: botResponse, sender: "bot" }]);
    }, 1000);
  };

  return (
    <div style={{ position: "fixed", bottom: "90px", left: "20px", zIndex: 9999 }}>
      {isOpen && (
        <div style={{
          width: "320px",
          height: "450px",
          backgroundColor: "var(--card-bg)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginBottom: "1rem",
          border: "1px solid var(--border-color)",
        }}>
          <div style={{ backgroundColor: "var(--primary-color)", color: "white", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={20} />
              <strong style={{ fontSize: "1rem" }}>Asisten Inklusi</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "rgba(0,0,0,0.02)" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.sender === "user" ? "var(--primary-color)" : "#e5e7eb",
                  color: msg.sender === "user" ? "white" : "#1f2937",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
                  borderBottomLeftRadius: msg.sender === "bot" ? "4px" : "16px",
                  maxWidth: "85%",
                  fontSize: "0.95rem",
                  lineHeight: "1.4",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", padding: "0.75rem", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya seputar layanan..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "20px", outline: "none", fontSize: "0.9rem", backgroundColor: "var(--background-color)", color: "var(--text-color)" }}
            />
            <button type="submit" style={{ background: "var(--secondary-color)", border: "none", width: "36px", height: "36px", borderRadius: "50%", marginLeft: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Send size={16} color="var(--text-color)" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "var(--primary-color)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isOpen ? "scale(0.9)" : "scale(1)",
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}
