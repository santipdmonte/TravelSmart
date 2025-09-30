"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastStatus = "idle" | "pending" | "success" | "error";

interface ToastState {
  status: ToastStatus;
  title?: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toastState: ToastState;
  showToast: (status: ToastStatus, title: string, message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<ToastState>({
    status: "idle",
  });

  const showToast = useCallback(
    (status: ToastStatus, title: string, message: string, duration?: number) => {
      setToastState({ status, title, message, duration });

      // Auto-hide if duration is provided and status is not pending
      if (duration && status !== "pending") {
        setTimeout(() => {
          setToastState({ status: "idle" });
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState({ status: "idle" });
  }, []);

  return (
    <ToastContext.Provider value={{ toastState, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
