"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardPage from "@/app/dashboard/page";

/**
 * Example component showing how to use DashboardSkeleton
 * This demonstrates the loading state before the actual dashboard loads
 */
export default function DashboardSkeletonExample() {
  const { state: authState } = useAuth();
  const { itineraries, loading } = useItinerary();
  const { fetchAllItineraries } = useItineraryActions();
  const [isLoading, setIsLoading] = useState(true);

  const user = authState.user;
  const isInitialized = Boolean(authState.isInitialized);
  const isAuthLoading = authState.isLoading;

  useEffect(() => {
    fetchAllItineraries();
  }, [fetchAllItineraries]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading simulation

    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (!isInitialized || isAuthLoading || loading || isLoading) {
    return <DashboardSkeleton />;
  }

  // Show actual dashboard when loaded
  return <DashboardPage />;
}
