import { Message as MessageType } from "@/types/agent";
import { useCallback } from "react";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isAI = message.type === "ai";
  
  const renderMarkdown = useCallback((md: string) => {
    try {
      const escapeHtml = (str: string) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      const lines = md.split(/\r?\n/);
      let html = "";
      let inList = false;
      const flushList = () => {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
      };
      for (const raw of lines) {
        const line = raw;
        // Headings
        const h3 = line.match(/^###\s+(.*)$/);
        const h2 = line.match(/^##\s+(.*)$/);
        const h1 = line.match(/^#\s+(.*)$/);
        if (h3 || h2 || h1) {
          flushList();
          const text = escapeHtml((h3?.[1] || h2?.[1] || h1?.[1] || "").trim());
          if (h1) html += `<h1 class="text-base font-semibold mt-2 mb-1">${text}</h1>`;
          else if (h2) html += `<h2 class="text-sm font-semibold mt-2 mb-1">${text}</h2>`;
          else html += `<h3 class="text-sm font-medium mt-2 mb-1">${text}</h3>`;
          continue;
        }
        // Unordered list
        const li = line.match(/^\s*[-*]\s+(.*)$/);
        if (li) {
          if (!inList) {
            html += '<ul class="list-disc pl-5 space-y-0.5 my-1">';
            inList = true;
          }
          let item = escapeHtml(li[1]);
          item = item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
          item = item.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 rounded text-xs">$1</code>');
          item = item.replace(/_(.*?)_/g, '<em>$1</em>');
          // Links
          item = item.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>');
          html += `<li class="text-sm">${item}</li>`;
          continue;
        }
        // Empty line -> paragraph break
        if (!line.trim()) {
          flushList();
          html += "<br/>";
          continue;
        }
        // Paragraph
        flushList();
        let paragraph = escapeHtml(line);
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        paragraph = paragraph.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 rounded text-xs">$1</code>');
        paragraph = paragraph.replace(/_(.*?)_/g, '<em>$1</em>');
        // Links
        paragraph = paragraph.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>');
        // Auto-link URLs
        paragraph = paragraph.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all">$1</a>');
        html += `<p class="text-sm leading-relaxed">${paragraph}</p>`;
      }
      if (inList) html += "</ul>";
      return html;
    } catch {
      return md;
    }
  }, []);

  if (message.type === 'tool') {
    return null;
  }
  
  const isEmptyAIPlaceholder = isAI && (!message.content || message.content.trim().length === 0);

  if (isEmptyAIPlaceholder) {
    return null;
  }

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
        {isAI ? (
          <div
            className="prose prose-sm max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}
