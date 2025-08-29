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
        "p-4 border rounded-lg text-left transition-all duration-200 flex flex-col items-center justify-center text-center overflow-hidden h-full w-full",
        isSelected
          ? "bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500"
          : "bg-white hover:bg-gray-50 hover:border-gray-300",
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
      <span className="font-semibold text-gray-800">{option.option}</span>
      {option.description && (
        <span className="text-sm text-gray-500 mt-1">{option.description}</span>
      )}
    </button>
  );
}
