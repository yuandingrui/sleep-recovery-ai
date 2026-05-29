"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: "rgba(30, 30, 35, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#fafafa",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 500,
          maxWidth: "340px",
        },
      }}
      gap={8}
      duration={3000}
      expand
      visibleToasts={3}
      closeButton
      richColors={false}
    />
  );
}
