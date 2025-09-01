"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmail } from "@/lib/authApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, X, Mail, CheckCircle, Key } from "lucide-react";

interface EmailVerificationBannerProps {
  className?: string;
}

export function EmailVerificationBanner({
  className = "",
}: EmailVerificationBannerProps) {
  const { user, refreshProfile, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Don't show if user is not logged in, email is verified, or banner is dismissed
  if (!user || user.email_verified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      if (user?.email) {
        await resendVerification(user.email);
      } else {
        throw new Error(
          "No hay un correo disponible para reenviar la verificación"
        );
      }
      setResendSuccess(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      setResendError(
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo de verificación"
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleVerifyToken = async () => {
    if (!verificationToken.trim()) {
      setVerifyError("Por favor, ingresa un token de verificación");
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const result = await verifyEmail(verificationToken);

      if (result.error) {
        setVerifyError(result.error);
      } else {
        setVerifySuccess(true);
        // Refresh user profile to update email_verified status
        await refreshProfile();
        // Hide success message after 3 seconds
        setTimeout(() => {
          setVerifySuccess(false);
          setShowTokenInput(false);
          setVerificationToken("");
        }, 3000);
      }
    } catch (error) {
      setVerifyError(
        error instanceof Error
          ? error.message
          : "No se pudo verificar el correo"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleTokenInput = () => {
    setShowTokenInput(!showTokenInput);
    setVerificationToken("");
    setVerifyError(null);
  };

  if (verifySuccess) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>¡Correo verificado con éxito! 🎉</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVerifySuccess(false)}
              className="h-auto p-1 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (resendSuccess) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>
              ¡Correo de verificación enviado con éxito! Revisa tu bandeja de
              entrada o ingresa tu token abajo.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResendSuccess(false)}
              className="h-auto p-1 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Se requiere verificación de correo</p>
              <p className="text-sm mt-1">
                Por favor, verifica tu dirección de correo para acceder a todas
                las funciones. Revisa tu bandeja de entrada para el enlace de
                verificación.
              </p>
              {resendError && (
                <p className="text-sm text-red-600 mt-1">{resendError}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-1" />
                    Reenviar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTokenInput}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                <Key className="h-3 w-3 mr-1" />
                {showTokenInput ? "Ocultar" : "Ingresar token"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-auto p-1 text-amber-600 hover:text-amber-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showTokenInput && (
            <div className="border-t border-amber-200 pt-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Ingresa tu token de verificación:
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ingresa el token de tu correo..."
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    className="flex-1 bg-white border-amber-300 focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVerifyToken();
                      }
                    }}
                  />
                  <Button
                    onClick={handleVerifyToken}
                    disabled={isVerifying || !verificationToken.trim()}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </div>
                {verifyError && (
                  <p className="text-sm text-red-600">{verifyError}</p>
                )}
                <p className="text-xs text-amber-700">
                  Copia el token del correo de verificación y pégalo aquí.
                </p>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
