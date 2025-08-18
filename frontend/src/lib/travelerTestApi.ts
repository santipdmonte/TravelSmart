import { apiRequest } from "./api"; // Asumiendo que apiRequest está exportado desde api.ts
import {
  Question,
  QuestionOption,
  QuestionWithOptions,
  UserTravelerTest,
  UserAnswerBulkCreate,
  TestResult,
  TravelerType,
  TestResultResponse,
  TestHistoryDetailResponse,
} from "@/types/travelerTest";
import { ApiResponse } from "@/types/itinerary"; // Reutilizamos ApiResponse

// ==================== TEST FLOW API FUNCTIONS ====================

/**
 * Fetches all public questions from the API.
 */
async function getPublicQuestions(): Promise<ApiResponse<Question[]>> {
  return apiRequest<Question[]>("/questions/public/all");
}

/**
 * Fetches all public options for a specific question ID.
 */
async function getPublicQuestionOptions(
  questionId: string
): Promise<ApiResponse<QuestionOption[]>> {
  return apiRequest<QuestionOption[]>(
    `/question-options/public/question/${questionId}`
  );
}

/**
 * Fetches all questions and then fetches their corresponding options,
 * combining them into a single data structure.
 */
export async function getTestQuestions(): Promise<
  ApiResponse<QuestionWithOptions[]>
> {
  const questionsResponse = await getPublicQuestions();
  if (questionsResponse.error || !questionsResponse.data) {
    return { error: questionsResponse.error || "Failed to fetch questions." };
  }

  try {
    const questionsWithOptions = await Promise.all(
      questionsResponse.data.map(async (question) => {
        const optionsResponse = await getPublicQuestionOptions(question.id);
        return {
          ...question,
          question_options: optionsResponse.data || [],
        };
      })
    );
    return { data: questionsWithOptions };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching options.",
    };
  }
}

/**
 * Starts a new traveler test session for the current user.
 */
export async function startTravelerTest(): Promise<
  ApiResponse<UserTravelerTest>
> {
  return apiRequest<UserTravelerTest>("/traveler-tests/", {
    method: "POST",
  });
}

/**
 * Submits all user answers in bulk for a given test.
 * @param answersData - The test ID and a list of selected option IDs.
 */
export async function submitUserAnswers(
  answersData: UserAnswerBulkCreate
): Promise<ApiResponse<TestResultResponse>> {
  // New backend bulk submission endpoint returns the final result
  return apiRequest<TestResultResponse>("/user-answers/bulk", {
    method: "POST",
    body: JSON.stringify(answersData),
  });
}

/**
 * Marks a traveler test as complete and triggers result calculation.
 * @param testId - The ID of the traveler test to complete.
 */
export async function completeTravelerTest(
  testId: string
): Promise<ApiResponse<UserTravelerTest>> {
  return apiRequest<UserTravelerTest>(
    `/traveler-tests/${testId}/complete`,
    {
      method: "POST",
    }
  );
}

// ==================== RESULTS API FUNCTIONS ====================

/**
 * Fetches the details of a completed traveler test, including the resulting traveler type.
 * @param testId - The ID of the traveler test.
 */
export async function getTestResult(
  testId: string
): Promise<ApiResponse<TestResult>> {
  return apiRequest<TestResult>(`/traveler-tests/${testId}`);
}

/**
 * Fetches the detailed information for a specific traveler type.
 * @param travelerTypeId - The ID of the traveler type.
 */
export async function getTravelerTypeDetails(
  travelerTypeId: string
): Promise<ApiResponse<TravelerType>> {
  return apiRequest<TravelerType>(`/traveler-types/${travelerTypeId}`);
}

// ==================== USER TEST HELPERS ====================

/**
 * Gets the current user's active (incomplete) traveler test if it exists.
 */
export async function getMyActiveTest(): Promise<
  ApiResponse<UserTravelerTest>
> {
  return apiRequest<UserTravelerTest>(`/traveler-tests/user/me/active`);
}

// ==================== ADMIN HISTORY API ====================

export async function getAdminTestHistory(
  testId: string
): Promise<ApiResponse<TestHistoryDetailResponse>> {
  return apiRequest<TestHistoryDetailResponse>(
    `/api/traveler-tests/${testId}/history`
  );
}
