import { apiRequest } from "./api";
import { ApiResponse } from "@/types/itinerary";
import { AdminUserWithProfile } from "@/types/admin";
import { TestHistoryDetailResponse } from "@/types/travelerTest";

export async function getUsersWithProfiles(params?: {
  skip?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<AdminUserWithProfile[]>> {
  const search = new URLSearchParams();
  if (params?.skip != null) search.set("skip", String(params.skip));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.status) search.set("status", params.status);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest<AdminUserWithProfile[]>(`/users/with-profiles${suffix}`);
}

/**
 * Fetches detailed test history for admin purposes
 * @param testId - The ID of the test to fetch history for
 */
export async function getAdminTestHistory(
  testId: string
): Promise<ApiResponse<TestHistoryDetailResponse>> {
  return apiRequest<TestHistoryDetailResponse>(`/admin/tests/${testId}/history`);
}
