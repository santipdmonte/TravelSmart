"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { Button, Textarea } from '@/components';
import { proposeItineraryChanges } from '@/lib/api';
import type { ItineraryDiffResponse } from '@/types/itinerary';

type Props = {
  onProposalReceived?: (data: ItineraryDiffResponse) => void;
};

export default function MessageInput({ onProposalReceived }: Props) {
  const { loading, threadId } = useChat();
  const { sendMessage } = useChatActions();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading || !threadId) {
      return;
    }

    const instruction = message.trim();
    setMessage(''); // Clear input immediately

    // 1) Keep chat behavior: show user message and AI thinking
    // sendMessage handles adding the user message and loading state
    const sendPromise = sendMessage(threadId, instruction);

    // 2) In parallel, request a proposal diff and lift state up; keep chat open
    proposeItineraryChanges(threadId, instruction)
      .then((resp) => {
        if (resp.data) {
          console.log('Proposed diff from chat:', resp.data);
          onProposalReceived?.(resp.data);
        } else if (resp.error) {
          console.error('Proposal error:', resp.error);
        }
      })
      .catch((err) => console.error('Proposal request failed:', err));

    await sendPromise;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize functionality
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1 resize-none rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-500 min-h-[38px] max-h-[120px]"
          disabled={loading}
          onInput={adjustHeight}
        />
        <Button
          type="submit"
          disabled={!message.trim() || loading}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 self-end"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </form>
    </div>
  );
} 