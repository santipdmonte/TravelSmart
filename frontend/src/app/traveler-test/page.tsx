"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TravelerTestContainer } from "@/components/traveler-test";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TravelerTestPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TravelerTestContainer />
      </div>
    </div>
  );
}
