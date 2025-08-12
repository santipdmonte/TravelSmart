"use client";

import { useState, useEffect, useRef } from "react";
import {
  getTestQuestions,
  startTravelerTest,
  submitUserAnswers,
  completeTravelerTest,
  getMyActiveTest,
} from "@/lib/travelerTestApi";
import {
  QuestionWithOptions,
  UserAnswerBulkCreate,
} from "@/types/travelerTest";
import { LoadingSpinner, ErrorMessage, Button } from "@/components";
import QuestionCard from "./QuestionCard";
import TestProgressBar from "./TestProgressBar";
import { useRouter } from "next/navigation";

export default function TravelerTestContainer() {
  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Para single-select: [opción]; para multi-select: [opción1, opción2, ...]
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<
    "loading" | "taking" | "submitting" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeTest = async () => {
      if (initializedRef.current) return; // guard against double-invoke in React Strict Mode
      initializedRef.current = true;
      try {
        // Reuse existing active test if present to avoid 400 from backend
        let activeTestId: string | null = null;
        const activeResp = await getMyActiveTest();
        if (activeResp.data && activeResp.data.id) {
          activeTestId = activeResp.data.id;
        } else {
          const testResponse = await startTravelerTest();
          if (testResponse.error || !testResponse.data) {
            throw new Error(testResponse.error || "Failed to start test.");
          }
          activeTestId = testResponse.data.id;
        }
        setTestId(activeTestId);

        const questionsResponse = await getTestQuestions();
        if (questionsResponse.error || !questionsResponse.data) {
          throw new Error(
            questionsResponse.error || "Failed to load questions."
          );
        }

        const sortedQuestions = questionsResponse.data.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setQuestions(sortedQuestions);
        setStatus("taking");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
        setStatus("error");
      }
    };

    initializeTest();
  }, []);

  // Use backend-provided multi_select flag when available
  const isMultiSelect = (q: QuestionWithOptions) => Boolean(q.multi_select);

  const handleAnswer = (questionId: string, optionId: string) => {
    const q = questions.find((qq) => qq.id === questionId);
    const multi = q ? isMultiSelect(q) : false;

    setAnswers((prev) => {
      const prevForQ = prev[questionId] || [];
      if (multi) {
        // toggle
        return {
          ...prev,
          [questionId]: prevForQ.includes(optionId)
            ? prevForQ.filter((id) => id !== optionId)
            : [...prevForQ, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!testId || Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const answerData: UserAnswerBulkCreate = {
        user_traveler_test_id: testId,
        answers: Object.values(answers).flat(),
      };

      const submitResponse = await submitUserAnswers(answerData);
      if (submitResponse.error) {
        throw new Error(submitResponse.error);
      }
      const completeResponse = await completeTravelerTest(testId);
      if (completeResponse.error || !completeResponse.data) {
        throw new Error(completeResponse.error || "Failed to finalize test.");
      }

      router.push(`/traveler-test/results/${testId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit the test."
      );
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="text-center p-12">
        <LoadingSpinner size="lg" />{" "}
        <p className="mt-4">Loading Traveler Test...</p>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasCurrent = Boolean(currentQuestion);
  const isLastQuestion =
    questions.length > 0 && currentQuestionIndex === questions.length - 1;
  const allAnswered =
    questions.length > 0 && Object.keys(answers).length === questions.length;

  const currentAnsweredCount = currentQuestion
    ? answers[currentQuestion.id]?.length || 0
    : 0;
  const currentIsMulti = currentQuestion
    ? isMultiSelect(currentQuestion)
    : false;
  const canGoNext = currentQuestion
    ? currentIsMulti
      ? currentAnsweredCount >= 1
      : currentAnsweredCount === 1
    : false;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        Discover Your Travel Personality
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Answer these questions to get a personalized travel profile.
      </p>

      <TestProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
      />

      {hasCurrent ? (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          selectedOptionIds={answers[currentQuestion.id] || []}
          isMultiSelect={currentIsMulti}
        />
      ) : (
        <div className="mt-6">
          <p className="text-center text-gray-600">
            No questions available right now.
          </p>
        </div>
      )}

      {hasCurrent && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || status === "submitting"}
              size="lg"
            >
              {status === "submitting" ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Submitting...
                </>
              ) : (
                "See My Results"
              )}
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              disabled={!currentQuestion || !canGoNext}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
