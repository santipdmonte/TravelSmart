"use client";

import { useParams } from "next/navigation";
import { TestResult } from "@/components/traveler-test";
import { LoadingSpinner } from "@/components";

export default function TestResultPage() {
  const params = useParams();
  const testId = params.testId as string;

  if (!testId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TestResult testId={testId} />
      </div>
    </div>
  );
}
