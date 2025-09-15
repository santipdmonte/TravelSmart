"use client";

import Loader from "@/components/loader/Loader";
import TextType from '@/components/TextType';

export default function LoaderDemoPage() {
  return (
    <main style={{
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      gap: 24,
    }}>
        <div style={{ textAlign: "center" }}>
            {/* <TextType 
                text={["Generando itinerario...", "Planificando actividades...", "Optimizando Rutas..."]}
                typingSpeed={100}
                pauseDuration={3000}
                showCursor={true}
                cursorCharacter="|"
                textColors={["#000000", "#000000", "#000000"]}
                className="text-xl font-bold"
            /> */}
            <Loader size={180} />

            <TextType 
                text={["Generando itinerario...", "Planificando Rutas...", "Optimizando Rutas...",
                    "Planificando actividades...", "Optimizando actividades...", "Generando enlaces de alojamiento..."]}
                typingSpeed={100}
                pauseDuration={4000}
                showCursor={false}
                cursorCharacter="|"
                textColors={["#000000", "#000000", "#000000"]}
                className="text-xl font-bold mt-4"
            />
        </div>
    </main>
  );
}


