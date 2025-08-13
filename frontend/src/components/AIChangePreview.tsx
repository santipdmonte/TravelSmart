"use client";

import { useEffect, useState } from "react";
import { proposeItineraryChanges } from "@/lib/api";
import type { ItineraryDiffResponse, ActivityStatus } from "@/types/itinerary";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useChatActions } from "@/hooks/useChatActions";
import { Button } from "@/components";
import ErrorMessage from "@/components/ErrorMessage";

type Props = {
  itineraryId: string;
  initialDiff?: ItineraryDiffResponse;
  onClear?: () => void;
};

function statusClasses(status: ActivityStatus): string {
  switch (status) {
    case "added":
      return "bg-green-50 border-green-300 text-green-800";
    case "deleted":
      return "bg-red-50 border-red-300 text-red-800 line-through opacity-70";
    case "modified":
      return "bg-yellow-50 border-yellow-300 text-yellow-900";
    case "unchanged":
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
}

export default function AIChangePreview({
  itineraryId,
  initialDiff,
  onClear,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<ItineraryDiffResponse | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { fetchItinerary } = useItineraryActions();
  const { confirmChanges } = useChatActions();

  // Sync initial diff from parent
  useEffect(() => {
    if (initialDiff) {
      setDiff(initialDiff);
    }
  }, [initialDiff]);

  const handlePreview = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await proposeItineraryChanges(
        itineraryId,
        "Make my 7-day trip into a 9-day trip."
      );
      console.log("AI Itinerary Diff Response:", response);
      if (response.error) {
        setError(response.error);
        setDiff(null);
        return;
      }
      if (response.data) {
        setDiff(response.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch preview");
      setDiff(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDiff(null);
    onClear?.();
  };

  const handleConfirm = async () => {
    if (!diff) return;
    try {
      setConfirming(true);
      setError(null);
      // Use the same confirmation logic as the chat button for consistency
      const ok = await confirmChanges(itineraryId);
      if (!ok) {
        setError("Failed to confirm changes");
        return;
      }
      // Refresh itinerary and clear preview
      await fetchItinerary(itineraryId);
      setDiff(null);
      onClear?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm changes");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-center">
        {!initialDiff && !diff && (
          <Button
            onClick={handlePreview}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Loading preview…" : "Preview AI Changes"}
          </Button>
        )}
        {diff && (
          <Button variant="secondary" onClick={handleClear} disabled={loading}>
            Clear preview
          </Button>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={handlePreview} />}

      {diff && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-left">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              AI Change Preview
            </h3>
            <p className="text-sm text-gray-600 mt-1">{diff.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded border bg-green-50 border-green-200 text-green-700">
                Added
              </span>
              <span className="px-2 py-1 rounded border bg-yellow-50 border-yellow-200 text-yellow-800">
                Modified
              </span>
              <span className="px-2 py-1 rounded border bg-red-50 border-red-200 text-red-700 line-through">
                Deleted
              </span>
              <span className="px-2 py-1 rounded border bg-gray-50 border-gray-200 text-gray-700">
                Unchanged
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {diff.days.map((day) => (
              <div key={day.day_number} className="">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3">
                    {day.day_number}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Day {day.day_number}
                  </h4>
                </div>
                <ul className="ml-11 space-y-2">
                  {day.activities.map((act) => (
                    <li
                      key={act.id}
                      className={`border rounded px-3 py-2 ${statusClasses(
                        act.status
                      )}`}
                    >
                      {act.name}
                      <span className="ml-2 text-xs opacity-70">
                        ({act.status})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Confirm / Cancel */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {confirming ? "Confirming…" : "Confirm Changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              disabled={confirming}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
