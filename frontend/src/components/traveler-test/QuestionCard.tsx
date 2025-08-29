import { QuestionWithOptions } from "@/types/travelerTest";
import {
  Card,
  CardContent,
  CardHeader,
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
    <Card className="mt-16 shadow-lg overflow-hidden">
      <CardHeader>
        {/*
        {question.image_url && (
          <div className="relative h-48 w-full mb-4">
            <Image
              src={question.image_url}
              alt={question.question}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
        */}
        <CardTitle className="text-xl text-center">
          {question.question}
        </CardTitle>
        {/*
        {question.category && (
          <CardDescription>Category: {question.category}</CardDescription>
        )}
        */}
        {isMultiSelect && (
          <CardDescription className="text-indigo-600 font-medium mt-1">
            You can select more than one option
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
