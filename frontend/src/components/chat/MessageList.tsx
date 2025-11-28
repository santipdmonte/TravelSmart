"use client";

import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import ConfirmationMessage from "./ConfirmationMessage";
import ErrorMessage from "../ErrorMessage";

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Initialization message */}
      <div className="flex justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">
              Configurando tu chat...
            </span>
          </div>
        </div>
      </div>

      {/* Skeleton message bubbles */}
      <div className="space-y-3">
        {/* AI message skeleton */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex justify-end">
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Another AI message skeleton */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageList() {
  const { messages, loading, error, hilState, threadId, initializing } =
    useChat();
  const { clearError } = useChatActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const userScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check if user is near the bottom of the scroll
  const checkIfAtBottom = () => {
    const node = scrollContainerRef.current;
    if (!node) return true;

    const threshold = 50; // Reduced threshold for smaller chat panel
    const isNearBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight < threshold;

    return isNearBottom;
  };

  // Handle scroll events to track position
  const handleScroll = () => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  };

  // Detect user-initiated scrolling (wheel or touch)
  const handleUserScroll = (e: WheelEvent | TouchEvent) => {
    // If user scrolls up, immediately disable auto-scroll
    if (e instanceof WheelEvent && e.deltaY < 0) {
      userScrollingRef.current = true;
      setIsAtBottom(false);
      setShowScrollButton(true);
    } else if (e instanceof TouchEvent) {
      userScrollingRef.current = true;
    }

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Re-enable auto-scroll detection after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      userScrollingRef.current = false;
      handleScroll(); // Update position after user stops
    }, 150);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    const node = scrollContainerRef.current;
    if (node) {
      setIsAtBottom(true); // Re-enable auto-scroll
      node.scrollTo({
        top: node.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Attach wheel and touch listeners for better scroll detection
  useEffect(() => {
    const node = scrollContainerRef.current;
    if (!node) return;

    node.addEventListener('wheel', handleUserScroll, { passive: true });
    node.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      node.removeEventListener('wheel', handleUserScroll);
      node.removeEventListener('touchmove', handleUserScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only auto-scroll if user was already at the bottom AND not actively scrolling
    const node = scrollContainerRef.current;
    if (node && isAtBottom && !userScrollingRef.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading, hilState, initializing, isAtBottom]);

  // Show loading skeleton during initialization
  if (initializing) {
    return (
      <div className="h-full overflow-y-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div
        className="h-full overflow-y-auto overscroll-contain"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="p-4">
          {error && <ErrorMessage message={error} onRetry={clearError} />}

          {messages.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Listo para ayudarte!
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Pregúntame lo que quieras sobre tu itinerario. Puedo ayudarte a
                modificar planes, agregar actividades o responder preguntas sobre
                tu viaje.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {/* Show HIL confirmation if available */}
          {hilState?.isHIL && threadId && <ConfirmationMessage />}

          {/* Small typing indicator while loading */}
          {loading && (
            <div className="flex justify-start mb-4 pl-2">
              <div className="flex space-x-1.5 items-center py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Floating scroll to bottom button */}
      <button
        onClick={scrollToBottom}
        className={`absolute bottom-3 right-6 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
                   hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg
                   flex items-center justify-center transition-all duration-300 hover:scale-110
                   z-10 ${
                     showScrollButton
                       ? "opacity-90 scale-100 pointer-events-auto"
                       : "opacity-0 scale-75 pointer-events-none"
                   }`}
        aria-label="Ir al final del chat"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  );
}
