import { Message as MessageType } from '@/types/agent';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isAI
            ? 'bg-gray-100 text-gray-800 rounded-bl-none'
            : 'bg-indigo-600 text-white rounded-br-none'
        }`}
      >
        {isAI && (
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-indigo-600">AI Assistant</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
} 