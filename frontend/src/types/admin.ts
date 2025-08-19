import type { TravelerType } from "./travelerTest";

export interface AdminUserWithProfile {
  id: string;
  email: string;
  username?: string | null;
  display_name?: string | null;
  traveler_type?: TravelerType | null;
  status: string;
  role: string;
  created_at: string;
}
