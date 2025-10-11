"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { setTokens, verifyGoogleToken } from "@/lib/authApi";
import type { TokenData } from "@/types/auth";

function GoogleValidateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch, refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setError("Token de validación de Google faltante.");
          setIsLoading(false);
          return;
        }

        const res = await verifyGoogleToken(token);
        if (res.error || !res.data) {
          setError(res.error || "No se pudo canjear el token de Google.");
          setIsLoading(false);
          return;
        }

        const tokens: TokenData = {
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
        };

        // Persist and update state
        setTokens(tokens);
        dispatch({ type: "SET_TOKENS", payload: tokens });

        // Hydrate profile then redirect
        await refreshProfile();
        router.replace("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error inesperado al validar Google."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch, refreshProfile, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span>Validando inicio de sesión con Google...</span>
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

export default function GoogleValidatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span>Cargando...</span>
        </div>
      </div>
    }>
      <GoogleValidateContent />
    </Suspense>
  );
}


