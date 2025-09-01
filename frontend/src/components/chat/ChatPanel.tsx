"use client";

import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatPanel() {
  const { isOpen } = useChat();
  const { closeChat } = useChatActions();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={closeChat}
      />

      {/* Chat panel - Fixed positioned with card styling */}
      <div
        className={`
        fixed
        top-16 lg:top-20 right-0 lg:right-4 bottom-0 lg:bottom-4 left-0 lg:left-auto
        w-full lg:w-1/3
        lg:max-w-md
        bg-white
        lg:rounded-lg
        lg:shadow-lg
        z-40
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        overscroll-contain
      `}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 lg:rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-900">Asistente IA</h3>
          </div>
          <button
            onClick={closeChat}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar chat"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 min-h-0 overscroll-contain">
          <MessageList />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="flex-shrink-0 lg:rounded-b-lg">
          <MessageInput />
        </div>
      </div>
    </>
  );
}
