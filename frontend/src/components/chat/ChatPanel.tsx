"use client";

import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatPanel() {
  const { isOpen } = useChat();
  const { closeChat } = useChatActions();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "bg-black bg-opacity-50 opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeChat}
      />

      {/* Chat panel - Fixed positioned with card styling */}
      <div
        className={`fixed top-16 lg:top-20 right-0 lg:right-4 bottom-0 lg:bottom-4 left-0 lg:left-auto
        w-full lg:w-1/3 lg:max-w-md bg-white lg:rounded-3xl lg:shadow-xl lg:border lg:border-blue-100 z-40 flex flex-col
        transform transition-transform duration-400 ease-out will-change-transform
        ${isOpen ? "translate-x-0" : "translate-x-[110%]"}
        overscroll-contain`}
        aria-hidden={!isOpen}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 lg:rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Asistente IA</h3>
              <p className="text-xs text-gray-600">Siempre listo para ayudarte</p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-2 rounded-full hover:bg-white/70 transition-all duration-200 hover:shadow-sm"
            aria-label="Cerrar chat"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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
        <div className="flex-shrink-0 lg:rounded-b-3xl">
          <MessageInput />
        </div>
      </div>
    </>
  );
}
