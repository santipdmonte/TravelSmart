import { QuestionWithOptions } from "@/types/travelerTest";
import {
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Option from "./Option";

interface QuestionCardProps {
  question: QuestionWithOptions;
  onAnswer: (questionId: string, optionId: string) => void;
  selectedOptionIds: string[]; // soporta multi-select
  isMultiSelect?: boolean;
}

export default function QuestionCard({
  question,
  onAnswer,
  selectedOptionIds,
  isMultiSelect = false,
}: QuestionCardProps) {
  return (
    <div className="px-6 pb-6">
      <div className="text-center mb-8">
        <CardTitle className="text-2xl text-gray-900 mb-3">
          {question.question}
        </CardTitle>
        {isMultiSelect && (
          <CardDescription className="text-sky-600 font-medium">
            Puedes seleccionar más de una opción
          </CardDescription>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {question.question_options.map((option, idx) => {
          const isLastSingle =
            question.question_options.length % 2 === 1 &&
            idx === question.question_options.length - 1;

          return (
            <div
              key={option.id}
              className={
                isLastSingle
                  ? "h-full md:col-span-2 flex justify-center"
                  : "h-full"
              }
            >
              <Option
                option={option}
                isSelected={selectedOptionIds.includes(option.id)}
                onClick={() => onAnswer(question.id, option.id)}
                multi={isMultiSelect}
                className={isLastSingle ? "md:w-1/2" : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
