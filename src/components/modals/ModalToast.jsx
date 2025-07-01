import React from "react";

export default function ModalToast({ show, message, type = "success", onClose }) {
  if (!show) return null;

  let colors = {
    success: { bg: "#19172c", border: "#4af176", text: "#fff" },
    error:   { bg: "#1a1313", border: "#e95050", text: "#fff" },
    warn:    { bg: "#2e2515", border: "#ffe060", text: "#fff" }
  }[type] || { bg: "#19172c", border: "#4af176", text: "#fff" };

  return (
    <div
      style={{
        position: "fixed",
        top: 36,
        right: 36,
        background: colors.bg,
        color: colors.text,
        padding: "16px 38px",
        borderRadius: 15,
        fontWeight: 700,
        fontSize: 17,
        boxShadow: "0 4px 28px #000a",
        zIndex: 9999,
        border: `2px solid ${colors.border}`,
        letterSpacing: 0.5,
        opacity: 0.97,
        animation: "fadeInDown .34s"
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
