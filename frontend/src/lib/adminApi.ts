import { apiRequest } from "./api";
import { ApiResponse } from "@/types/itinerary";
import { AdminUserWithProfile } from "@/types/admin";

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
