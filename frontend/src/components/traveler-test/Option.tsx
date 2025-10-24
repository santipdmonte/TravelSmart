import { QuestionOption } from "@/types/travelerTest";
import { cn } from "@/lib/utils";

interface OptionProps {
  option: QuestionOption;
  isSelected: boolean;
  onClick: () => void;
  multi?: boolean;
  className?: string;
}

export default function Option({
  option,
  isSelected,
  onClick,
  className,
}: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Fill parent height and center content vertically
        "p-6 border-2 rounded-2xl text-left transition-all duration-200 flex flex-col items-center justify-center text-center overflow-hidden h-full w-full shadow-sm hover:shadow-md",
        isSelected
          ? "bg-sky-50 border-sky-500 ring-2 ring-sky-500 shadow-lg"
          : "bg-white border-gray-200 hover:bg-palette-light-sky hover:border-gray-300",
        className
      )}
    >
      {/*
      {option.image_url && (
        <div className="relative h-32 w-full mb-3">
          <Image
            src={option.image_url}
            alt={option.option}
            fill
            className="rounded-md object-cover"
          />
        </div>
      )}
      */}
      <span className={cn(
        "font-semibold text-base",
        isSelected ? "text-sky-800" : "text-gray-800"
      )}>
        {option.option}
      </span>
      {option.description && (
        <span className={cn(
          "text-sm mt-2 leading-relaxed",
          isSelected ? "text-sky-600" : "text-gray-500"
        )}>
          {option.description}
        </span>
      )}
    </button>
  );
}
