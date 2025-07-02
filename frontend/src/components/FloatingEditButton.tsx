'use client';

import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';

interface FloatingEditButtonProps {
  itineraryId: string;
}

export default function FloatingEditButton({ itineraryId }: FloatingEditButtonProps) {
  const { isOpen: isChatOpen } = useChat();
  const { openChat } = useChatActions();

  const handleEditWithAI = async () => {
    if (itineraryId) {
      await openChat(itineraryId);
    }
  };

  // Don't render if chat is open
  if (isChatOpen) {
    return null;
  }

  return (
    <button
      onClick={handleEditWithAI}
      className="fixed bottom-[25px] right-[25px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 lg:px-6 lg:py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 lg:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 z-40"
      aria-label="Edit with AI"
    >
      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span className="text-sm lg:text-base">Edit with AI</span>
    </button>
  );
} 