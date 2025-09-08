import { Message as MessageType } from "@/types/agent";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isAI = message.type === "ai";
  if (message.type === 'tool') {
    return null;
  }
  const isEmptyAIPlaceholder = isAI && (!message.content || message.content.trim().length === 0);

  if (isEmptyAIPlaceholder) {
    return null;
  }

  const linkifiedContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      const isUrl = part.startsWith('http://') || part.startsWith('https://');
      if (isUrl) {
        return (
          <a
            key={`url-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={`txt-${index}`}>{part}</span>;
    });
  };

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isAI
            ? "bg-gray-100 text-gray-800 rounded-bl-none"
            : "bg-indigo-600 text-white rounded-br-none"
        }`}
      >
        {isAI && (
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-indigo-600">
              Asistente
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {linkifiedContent(message.content)}
        </p>
      </div>
    </div>
  );
}
