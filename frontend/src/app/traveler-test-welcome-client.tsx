"use client";

import { useEffect, useState } from "react";
import { TravelerTestPromptModal } from "@/components";
import { useAuth } from "@/hooks/useAuth";

export default function ClientTravelerTestWelcome() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || hasShown) return;
    const isFirstLogin = (user.login_count ?? 0) === 1;
    const missingTravelerType = !user.traveler_type_id;

    if (isFirstLogin && missingTravelerType) {
      setOpen(true);
      setHasShown(true);
    }
  }, [isAuthenticated, user, hasShown]);

  if (!open) return null;

  return (
    <TravelerTestPromptModal
      open={open}
      onClose={() => setOpen(false)}
      title="¡Bienvenido! Personaliza tu experiencia"
      message="Te tomará 2 minutos. Completa el Traveler Test para adaptar tus itinerarios, actividades y recomendaciones a tu estilo."
      ctaText="Hacer el test"
    />
  );
}
