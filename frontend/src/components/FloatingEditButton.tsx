"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { Button } from "./ui/button";

interface FloatingEditButtonProps {
  itineraryId: string;
}

export default function FloatingEditButton({
  itineraryId,
}: FloatingEditButtonProps) {
  const { isOpen: isChatOpen } = useChat();
  const { openChat, sendMessage } = useChatActions();
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Collapse on outside click when empty
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      if (value.trim().length === 0) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [value]);

  // Don't render if chat is open
  if (isChatOpen) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className={`ai-composer-wrap ${expanded ? 'ai-expanded' : 'ai-collapsed'}`}
      onClick={() => {
        if (!expanded) setExpanded(true);
        inputRef.current?.focus();
      }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLDivElement).style.setProperty("--mx", `${mx}%`);
        (e.currentTarget as HTMLDivElement).style.setProperty("--my", `${my}%`);
      }}
    >
      <div className="ai-composer-shadow" />
      <form
        className="ai-composer"
        onSubmit={async (e) => {
          e.preventDefault();
          const message = value.trim();
          if (!message) return;
          const ok = await openChat(itineraryId);
          if (ok) {
            await sendMessage(itineraryId, message);
          }
          setValue("");
          setExpanded(true);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Edita este itinerario con IA..."
          value={value}
          onFocus={() => setExpanded(true)}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            if (next.length > 0) setExpanded(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value.trim().length === 0) {
              setExpanded(false);
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          aria-label="Mensaje para el asistente"
        />
        <Button type="submit" className="ai-send">
          Enviar
        </Button>
      </form>
    </div>
  );
}
