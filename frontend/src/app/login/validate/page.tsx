"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmailValidationToken, setTokens } from "@/lib/authApi";
import type { TokenData } from "@/types/auth";

export default function ValidateLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch, refreshProfile } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get("email_validation_token");
    if (!token) {
      setError("Token de verificación inválido o ausente.");
      setIsVerifying(false);
      return;
    }

    (async () => {
      try {
        const res = await verifyEmailValidationToken(token);
        if (res.error || !res.data) {
          setError(res.error || "No se pudo verificar el token.");
          setIsVerifying(false);
          return;
        }

        const tokens: TokenData = {
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
        };

        // Persist tokens and update auth state
        setTokens(tokens);
        dispatch({ type: "SET_TOKENS", payload: tokens });

        // Hydrate profile and then redirect
        await refreshProfile();
        router.replace("/itineraries");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado."
        );
      } finally {
        setIsVerifying(false);
      }
    })();
  }, [dispatch, refreshProfile, router, searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span>Verificando tu acceso...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full border rounded-lg p-6 shadow-sm bg-white">
          <h1 className="text-lg font-semibold mb-2">No pudimos iniciar sesión</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Volver a iniciar sesión
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


