"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface TravelerTestPromptModalProps {
  open: boolean;
  title?: string;
  message?: string;
  ctaText?: string;
  onClose?: () => void;
  onAction?: () => void; // optional custom handler for CTA
}

export default function TravelerTestPromptModal({
  open,
  title = "Completa tu Traveler Test",
  message = "Cuéntanos tu estilo de viaje y preferencias. Usaremos esta info para personalizar tus itinerarios, recomendaciones y experiencias.",
  ctaText = "Hacer el test",
  onClose,
  onAction,
}: TravelerTestPromptModalProps) {
  const router = useRouter();

  const goToTest = () => {
    if (onAction) {
      onAction();
    } else {
      // Close modal by default before navigating so it doesn't persist after route change
      onClose?.();
      router.push("/traveler-test");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent showCloseButton onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Ahora no
          </Button>
          <Button onClick={goToTest}>{ctaText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
