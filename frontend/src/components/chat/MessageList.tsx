'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/AgentContext';
import Message from './Message';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MessageList() {
  const { messages, loading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !loading ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Start a conversation to edit your itinerary!</p>
        </div>
      ) : (
        messages.map((message) => (
          <Message key={message.id} message={message} />
        ))
      )}
      
      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-2 rounded-bl-none">
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
} 