"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { Button, Textarea } from "@/components";

export default function MessageInput() {
  const { loading, threadId } = useChat();
  const { sendMessage } = useChatActions();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || loading || !threadId) {
      return;
    }

    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately

    await sendMessage(threadId, messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize functionality
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  return (
    <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 resize-none rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 min-h-[44px] max-h-[120px] bg-white shadow-sm transition-all duration-200 pr-3 pl-4 py-3 text-sm overflow-hidden scrollbar-none"
            disabled={loading}
            onInput={adjustHeight}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || loading}
          className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center p-0 flex-shrink-0"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </Button>
      </form>
    </div>
  );
}
