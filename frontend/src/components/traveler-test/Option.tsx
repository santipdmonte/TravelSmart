import { QuestionOption } from "@/types/travelerTest";
import { cn } from "@/lib/utils";
import Image from "next/image"; // Importar el componente Image

interface OptionProps {
  option: QuestionOption;
  isSelected: boolean;
  onClick: () => void;
}

export default function Option({ option, isSelected, onClick }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-4 border rounded-lg text-left transition-all duration-200 flex flex-col items-center text-center overflow-hidden",
        isSelected
          ? "bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500"
          : "bg-white hover:bg-gray-50 hover:border-gray-300"
      )}
    >
      {option.image_url && (
        <div className="relative h-32 w-full mb-3">
          <Image
            src={option.image_url}
            alt={option.option}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      )}
      <span className="font-semibold text-gray-800">{option.option}</span>
      {option.description && (
        <span className="text-sm text-gray-500 mt-1">{option.description}</span>
      )}
    </button>
  );
}
