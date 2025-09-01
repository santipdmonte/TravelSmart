"use client";

import Link from "next/link";
import { Button } from "@/components";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { isAuthenticated, userDisplayName } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                Bienvenido de nuevo,{" "}
                <span className="text-indigo-700">{userDisplayName}</span>!
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                ¿Listo para planear tu próxima aventura? Crea un nuevo
                itinerario o explora tus viajes existentes.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                Bienvenido a{" "}
                <span className="text-indigo-700">TravelSmart</span>
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Crea itinerarios de viaje personalizados con ayuda de IA.
                Planifica tu viaje perfecto en minutos.
              </p>
            </>
          )}
        </header>

        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 px-8 py-4 text-lg"
          >
            <Link href="/create">Crear tu itinerario</Link>
          </Button>

          <div className="mt-8">
            <Button
              asChild
              variant="link"
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Link href="/itineraries">Ver tus itinerarios →</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Impulsado por IA
            </h3>
            <p className="text-gray-700">
              Nuestra IA crea itinerarios personalizados según tus preferencias
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Rápido y fácil
            </h3>
            <p className="text-gray-700">
              Genera itinerarios completos en minutos, no en horas
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Planes detallados
            </h3>
            <p className="text-gray-700">
              Obtén actividades día a día y recomendaciones de destinos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
