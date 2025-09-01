"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Settings,
  ArrowLeft,
  Bell,
  Shield,
  Globe,
  CreditCard,
  User,
  MapPin,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const comingSoonFeatures = [
    {
      icon: Bell,
      title: "Preferencias de notificaciones",
      description:
        "Administra las notificaciones por correo y push para tus viajes y actualizaciones de cuenta",
    },
    {
      icon: Shield,
      title: "Privacidad y seguridad",
      description:
        "Controla la visibilidad de tu perfil, el intercambio de datos y la seguridad de tu cuenta",
    },
    {
      icon: Globe,
      title: "Idioma y región",
      description:
        "Configura tu idioma preferido, moneda y preferencias regionales",
    },
    {
      icon: MapPin,
      title: "Preferencias de viaje",
      description:
        "Configura tu estilo de viaje, restricciones alimentarias y necesidades de accesibilidad",
    },
    {
      icon: CreditCard,
      title: "Gestión de suscripción",
      description:
        "Administra tu plan de suscripción e información de facturación",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="p-2">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">
              Administra tus preferencias de cuenta y privacidad
            </p>
          </div>
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">
              Próximamente: Configuración avanzada
            </CardTitle>
            <CardDescription>
              Estamos trabajando en configuraciones completas para darte control
              total sobre tu experiencia en TravelSmart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comingSoonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-600">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Mientras tanto, puedes administrar tu información básica desde
                tu perfil.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Volver al perfil
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Ir al panel</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disponible ahora</CardTitle>
            <CardDescription>
              Configuraciones básicas que puedes administrar hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Información del perfil</h4>
                  <p className="text-sm text-gray-600">
                    Actualiza tu nombre, usuario, biografía y detalles básicos
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">Administrar</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Verificación de correo</h4>
                  <p className="text-sm text-gray-600">
                    Verifica tu correo para acceder a todas las funciones
                    {user.email_verified && (
                      <span className="text-green-600 ml-1">✓ Verificado</span>
                    )}
                  </p>
                </div>
                {!user.email_verified && (
                  <Button variant="outline" size="sm" disabled>
                    Revisar correo
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Estado de la cuenta</h4>
                  <p className="text-sm text-gray-600">
                    Tu cuenta está actualmente{" "}
                    <span className="font-medium">{user.status}</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Activa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
