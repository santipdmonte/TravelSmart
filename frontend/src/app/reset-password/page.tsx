"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordResetConfirmForm } from "@/components/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Key className="h-8 w-8 text-blue-600" />
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
              <CardTitle className="text-xl">
                Restablece tu contraseña
              </CardTitle>
              <CardDescription>
                Ingresa una nueva contraseña para tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {token ? (
                <PasswordResetConfirmForm token={token} />
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    Enlace para restablecer la contraseña inválido. Por favor,
                    solicita uno nuevo.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
