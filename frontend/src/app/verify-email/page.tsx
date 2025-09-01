"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyEmailPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, isAuthenticated, user } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const attemptedTokenRef = useRef<string | null>(null);

  // Usamos useCallback para que la función no se recree en cada render, evitando bucles.
  const runVerification = useCallback(
    async (token: string) => {
      try {
        const success = await verifyEmail(token);
        if (success) {
          setVerificationStatus("success");
          // Remove token from URL to avoid accidental re-verification on re-renders
          try {
            router.replace("/verify-email?verified=1");
          } catch {}
          setTimeout(() => {
            setIsRedirecting(true);
            router.push("/");
          }, 5000);
        } else {
          setVerificationStatus("error");
          setErrorMessage(
            "La verificación de correo falló. El enlace puede estar expirado o ser inválido."
          );
        }
      } catch {
        setVerificationStatus("error");
        setErrorMessage("Ocurrió un error inesperado durante la verificación.");
      }
    },
    [verifyEmail, router]
  );

  // Este useEffect se ejecutará solo una vez o si cambian sus dependencias estables.
  useEffect(() => {
    // If already authenticated and verified, mark success and stop
    if (isAuthenticated && user?.email_verified) {
      setVerificationStatus("success");
      return;
    }

    // Validate token presence
    const token = searchParams.get("token");
    if (!token) {
      // If we've already succeeded or user is verified, don't flip to error
      if (
        !(isAuthenticated && user?.email_verified) &&
        verificationStatus === "loading"
      ) {
        setVerificationStatus("error");
        setErrorMessage(
          "Enlace de verificación inválido. No se proporcionó token."
        );
      }
      return;
    }

    // Ensure we only attempt verification once per token
    if (attemptedTokenRef.current === token) {
      return;
    }
    attemptedTokenRef.current = token;

    // Only attempt when in loading state
    if (verificationStatus === "loading") {
      runVerification(token);
    }
  }, [
    searchParams,
    isAuthenticated,
    user,
    runVerification,
    verificationStatus,
  ]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Verificando tu correo
            </h2>
            <p className="text-sm text-muted-foreground">
              Por favor, espera...
            </p>
          </div>
        );
      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              ¡Correo verificado con éxito!
            </h2>
            <p className="text-sm text-muted-foreground">
              ¡Bienvenido a TravelSmart! Ya puedes empezar a planear.
            </p>
            {isRedirecting && (
              <p className="text-sm text-blue-600">Redirigiéndote...</p>
            )}
            <Button
              onClick={() => router.push("/")}
              className="mt-4"
              disabled={isRedirecting}
            >
              {isRedirecting ? "Redirigiendo..." : "Ir al inicio"}
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Verificación fallida
            </h2>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Ir a Iniciar sesión</Link>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                TravelSmart
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verificación de correo</CardTitle>
              <CardDescription>
                Completa la configuración de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
          </Card>
        </div>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 TravelSmart. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {/* simple fallback spinner text to avoid importing icons here */}
              <span className="text-blue-600 animate-pulse">Cargando…</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Preparando verificación…
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailPageInner />
    </Suspense>
  );
}
