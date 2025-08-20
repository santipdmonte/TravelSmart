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
        <CardTitle className="text-xl">{question.question}</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.question_options.map((option) => (
            <Option
              key={option.id}
              option={option}
              isSelected={selectedOptionIds.includes(option.id)}
              onClick={() => onAnswer(question.id, option.id)}
              multi={isMultiSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
