"use client";

import { useEffect, useState } from "react";
import { getTestResult } from "@/lib/travelerTestApi";
import { TestResult as TestResultType } from "@/types/travelerTest";
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Importar el componente Image

interface TestResultProps {
  testId: string;
}

export default function TestResult({ testId }: TestResultProps) {
  // ... (el resto del código del componente sigue igual) ...
  const [result, setResult] = useState<TestResultType | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const response = await getTestResult(testId);
      if (response.error || !response.data) {
        setError(response.error || "Could not fetch test results.");
        setStatus("error");
      } else {
        setResult(response.data);
        setStatus("success");
      }
    };
    fetchResult();
  }, [testId]);

  if (status === "loading") {
    return (
      <div className="text-center p-12">
        <LoadingSpinner size="lg" />{" "}
        <p className="mt-4">Calculating your results...</p>
      </div>
    );
  }

  if (status === "error" || !result || !result.traveler_type) {
    return (
      <ErrorMessage
        message={error || "An error occurred while fetching your results."}
      />
    );
  }

  const { traveler_type } = result;

  return (
    <Card className="max-w-2xl mx-auto my-8 shadow-2xl overflow-hidden">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-indigo-600">
          YOUR TRAVELER TYPE IS
        </p>
        <CardTitle className="text-4xl font-bold">
          {traveler_type.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {traveler_type.image_url && (
          <div className="relative h-56 w-full my-4">
            <Image
              src={traveler_type.image_url}
              alt={traveler_type.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
        <CardDescription className="text-lg text-gray-700 my-4">
          {traveler_type.description}
        </CardDescription>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/create">Create a Personalized Itinerary</Link>
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            We will now use this result to tailor your travel suggestions!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
