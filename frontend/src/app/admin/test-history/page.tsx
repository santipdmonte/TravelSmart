"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminTestHistoryIndex() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">Admin Test History</h1>
        <p className="text-gray-600">
          Use the dynamic page to view a specific test history:
        </p>
        <code className="bg-gray-100 px-2 py-1 rounded">
          /admin/test-history/[testId]
        </code>
        <p className="text-gray-600">
          Replace <code>[testId]</code> with the Traveler Test ID. Example:
        </p>
        <Link
          className="text-indigo-600 underline"
          href="/admin/test-history/00000000-0000-0000-0000-000000000000"
        >
          /admin/test-history/00000000-0000-0000-0000-000000000000
        </Link>
      </div>
    </div>
  );
}
