"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import PasswordResetRequestForm from "./PasswordResetRequestForm";

type AuthView = "login" | "register" | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  // const [activeTab, setActiveTab] = useState(defaultTab);
  const [view, setView] = useState<AuthView>(defaultTab);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  // Sync activeTab with defaultTab when it changes
  useEffect(() => {
    if (isOpen) {
      setView(defaultTab);
      setShowRegistrationSuccess(false);
    }
  }, [isOpen, defaultTab]);

  const handleLoginSuccess = () => {
    // Close modal on successful login
    onClose();
  };

  const handleRegistrationSuccess = () => {
    // Show registration success message instead of closing
    setShowRegistrationSuccess(true);
  };

  const handleForgotPasswordSuccess = () => {
    // UI of success is already in the component, it's not needed to do anything here
  };

  const handleClose = () => {
    // Reset states when closing
    setView(defaultTab);
    setShowRegistrationSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* Radix A11y: DialogContent requires a DialogTitle. We provide a visually-hidden one. */}
        <DialogHeader>
          <DialogTitle className="sr-only">Autenticación</DialogTitle>
        </DialogHeader>

        {showRegistrationSuccess ? (
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">
                ¡Cuenta creada con éxito!
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                ¡Bienvenido a TravelSmart! Por favor, verifica tu correo para
                comenzar.
              </p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-medium">
                    Revisa tu correo para verificar tu cuenta
                  </p>
                  <p className="text-sm">
                    Te enviamos un correo de verificación. Haz clic en el enlace
                    del correo o copia el token para verificar tu cuenta.
                  </p>
                  <p className="text-sm">
                    Una vez verificado, podrás acceder a todas las funciones de
                    TravelSmart, incluyendo crear y gestionar tus itinerarios.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3 mt-6">
              <Button onClick={handleClose} className="flex-1">
                Continuar a la app
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRegistrationSuccess(false);
                  setView("login");
                }}
                className="flex-1"
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        ) : view === "forgot-password" ? (
          <PasswordResetRequestForm
            onSuccess={handleForgotPasswordSuccess}
            onSwitchToLogin={() => setView("login")}
          />
        ) : (
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as "login" | "register")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setView("register")}
                onSwitchToForgotPassword={() => setView("forgot-password")}
              />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onSwitchToLogin={() => setView("login")}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
