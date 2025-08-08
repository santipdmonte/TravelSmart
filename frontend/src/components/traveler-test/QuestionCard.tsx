import { QuestionWithOptions } from "@/types/travelerTest";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Option from "./Option";
import Image from "next/image"; // Importar el componente Image

interface QuestionCardProps {
  question: QuestionWithOptions;
  onAnswer: (questionId: string, optionId: string) => void;
  selectedOption: string | undefined;
}

export default function QuestionCard({
  question,
  onAnswer,
  selectedOption,
}: QuestionCardProps) {
  return (
    <Card className="mt-6 shadow-lg overflow-hidden">
      <CardHeader>
        {question.image_url && (
          <div className="relative h-48 w-full mb-4">
            <Image
              src={question.image_url}
              alt={question.question}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
        <CardTitle className="text-xl">{question.question}</CardTitle>
        {question.category && (
          <CardDescription>Category: {question.category}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.question_options.map((option) => (
            <Option
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              onClick={() => onAnswer(question.id, option.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
