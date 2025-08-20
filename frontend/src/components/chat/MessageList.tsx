'use client';

import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { useEffect, useRef } from 'react';
import Message from './Message';
import ConfirmationMessage from './ConfirmationMessage';
import ErrorMessage from '../ErrorMessage';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Initialization message */}
      <div className="flex justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">Setting up your chat...</span>
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
  const { messages, loading, error, hilState, threadId, initializing } = useChat();
  const { clearError } = useChatActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, hilState, initializing]);

  // Show loading skeleton during initialization
  if (initializing) {
    return (
      <div className="h-full overflow-y-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {error && (
          <ErrorMessage message={error} onRetry={clearError} />
        )}
        
        {messages.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to help!</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Ask me anything about your itinerary. I can help you modify plans, add activities, or answer questions about your trip.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {/* Show HIL confirmation if available */}
        {hilState?.isHIL && threadId && (
          <ConfirmationMessage />
        )}

        {loading && (
          <div className="flex items-center space-x-2 p-4 text-gray-700">
            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
} 