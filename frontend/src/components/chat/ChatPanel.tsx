'use client';

import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatPanel() {
  const { isOpen } = useChat();
  const { closeChat } = useChatActions();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={closeChat} />
      
      {/* Chat panel - Fixed positioned on all screen sizes */}
      <div className={`
        fixed
        inset-y-0 right-0 
        w-full lg:w-1/3
        bg-white
        border-l border-gray-200
        z-50
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        h-screen
        overscroll-contain
      `}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <button
            onClick={closeChat}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 min-h-0 overscroll-contain">
          <MessageList />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="flex-shrink-0">
          <MessageInput />
        </div>
      </div>
    </>
  );
} 