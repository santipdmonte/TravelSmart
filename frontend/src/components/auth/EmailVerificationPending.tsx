"use client";

import { useState } from "react";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailVerificationPendingProps {
  email: string;
  onResendSuccess?: () => void;
  onResendError?: (error: string) => void;
}

export default function EmailVerificationPending({
  email,
  onResendSuccess,
  onResendError,
}: EmailVerificationPendingProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resendVerification } = useAuth();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const success = await resendVerification(email);

      if (success) {
        setResendSuccess(true);
        onResendSuccess?.();

        // Clear success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        onResendError?.("No se pudo reenviar el correo de verificación");
      }
    } catch {
      onResendError?.("No se pudo reenviar el correo de verificación");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Revisa tu correo</h2>
        <p className="text-sm text-muted-foreground">
          Te hemos enviado un enlace de verificación a <strong>{email}</strong>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Verifica tu dirección de correo
          </CardTitle>
          <CardDescription>
            Haz clic en el enlace de verificación en tu correo para completar tu
            registro y empezar a usar TravelSmart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">¿Qué sigue?</p>
                <ul className="mt-2 space-y-1">
                  <li>• Haz clic en el enlace de verificación de tu correo</li>
                  <li>• Se iniciará tu sesión automáticamente</li>
                  <li>• ¡Empieza a planear tu primer viaje!</li>
                </ul>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Correo de verificación enviado con éxito! Por favor, revisa tu
                bandeja de entrada.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              ¿No recibiste el correo? Revisa tu carpeta de spam o vuelve a
              enviar el correo de verificación.
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Reenviar correo de verificación
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          ¿Tienes problemas? Contacta a nuestro equipo de soporte en{" "}
          <a
            href="mailto:support@travelsmart.com"
            className="text-blue-600 hover:underline"
          >
            support@travelsmart.com
          </a>
        </p>
      </div>
    </div>
  );
}
