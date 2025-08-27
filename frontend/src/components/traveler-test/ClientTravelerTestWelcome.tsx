"use client";

import { TravelerTestPromptModal } from "@/components";
import { useAuth } from "@/hooks/useAuth";

export default function ClientTravelerTestWelcome() {
  const { state, dispatch } = useAuth();

  console.log(
    "ClientWelcome [render]: Componente renderizado. El valor de state.showWelcomePopup es:",
    state.showWelcomePopup
  );

  if (!state.showWelcomePopup) return null;

  return (
    <TravelerTestPromptModal
      open={state.showWelcomePopup}
      onClose={() => dispatch({ type: "SHOW_WELCOME_POPUP", payload: false })}
      title="¡Bienvenido! Personaliza tu experiencia"
      message="Te tomará 2 minutos. Completa el Traveler Test para adaptar tus itinerarios, actividades y recomendaciones a tu estilo."
      ctaText="Hacer el test"
    />
  );
}
