"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminTestHistory } from "@/lib/adminApi";
import { TestHistoryDetailResponse } from "@/types/travelerTest";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { LoadingSpinner, ErrorMessage } from "@/components";
import { Badge } from "@/components/ui/badge";

export default function AdminTestHistoryPage() {
  const params = useParams();
  const testId = params.testId as string;
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [data, setData] = useState<TestHistoryDetailResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      const res = await getAdminTestHistory(testId);
      if (res.error || !res.data) {
        setError(res.error || "Failed to fetch history.");
        setStatus("error");
      } else {
        setData(res.data);
        setStatus("success");
      }
    };
    load();
  }, [testId]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorMessage message={error || "Unable to load test history."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Traveler Test History</CardTitle>
            <CardDescription>
              Test ID: <code>{data.test_id}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">User ID:</span>{" "}
                <code>{data.user_id}</code>
              </div>
              {data.traveler_type_name && (
                <div>
                  <span className="font-medium">Traveler Type:</span>{" "}
                  {data.traveler_type_name}
                </div>
              )}
              <div>
                <Badge variant="outline">
                  {data.completed_at
                    ? `Completed: ${new Date(
                        data.completed_at
                      ).toLocaleString()}`
                    : "Not Completed"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {data.answers.map((a) => (
                <Card key={`${a.question_id}-${a.selected_option_id}`}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {a.question_text}
                    </CardTitle>
                    {a.created_at && (
                      <CardDescription>
                        Answered: {new Date(a.created_at).toLocaleString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="font-medium">Selected:</span>{" "}
                      {a.selected_option_text}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
