"use client";

import { useToast } from "@/contexts/ToastContext";
import { usePathname, useSearchParams } from "next/navigation";

export function Toast() {
  const { toastState } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (toastState.status === "idle") {
    return null;
  }

  // Ocultar el toast pending si estamos en la pestaña de actividades del itinerario
  const isItineraryPage = pathname?.startsWith("/itinerary/");
  const currentTab = searchParams?.get("tab");
  const isItineraryTab = currentTab === "itinerary";

  if (toastState.status === "pending" && isItineraryPage && isItineraryTab) {
    return null;
  }

  const { status, title, message } = toastState;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`rounded-2xl shadow-2xl border px-5 py-4 min-w-[280px] max-w-[320px] ${
          status === "pending"
            ? "bg-sky-50 border-sky-200"
            : status === "success"
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {status === "pending" && (
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
            )}
            {status === "success" && (
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold ${
                status === "pending"
                  ? "text-sky-900"
                  : status === "success"
                  ? "text-green-900"
                  : "text-red-900"
              }`}
            >
              {title}
            </p>
            {message && (
              <div
                className={`text-xs mt-1 ${
                  status === "pending"
                    ? "text-sky-700"
                    : status === "success"
                    ? "text-green-700"
                    : "text-red-700"
                } [&_a]:underline [&_a]:font-semibold hover:[&_a]:opacity-80`}
                dangerouslySetInnerHTML={{ __html: message }}
              />
            )}
          </div>

          {/* Close button */}
          {/* {status !== "pending" && (
            <button
              onClick={hideToast}
              className={`flex-shrink-0 transition-colors ${
                status === "success"
                  ? "text-green-600 hover:text-green-800"
                  : "text-red-600 hover:text-red-800"
              }`}
              aria-label="Cerrar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}
