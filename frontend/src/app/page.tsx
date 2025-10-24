"use client";

import Link from "next/link";
import { Button } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import MagicBento from "@/components/MagicBento";
import ProfileCard from "@/components/ProfileCard";

export default function LandingPage() {
  const { isAuthenticated, userDisplayName } = useAuth();

  return (
    <div className="min-h-screen bg-palette-light-sky">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-10">
        {/* Badge/Announcement */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-sky-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
            </span>
            <span className="text-sm font-medium text-gray-700">
              Impulsado por IA de última generación
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 mb-4 leading-tight">
                Bienvenido de nuevo,{" "}
                <span className="block mt-2">{userDisplayName}!</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                ¿Listo para planear tu próxima aventura?{" "}
                <span className="font-medium text-gray-700">
                  Crea un nuevo itinerario
                </span>{" "}
                o explora tus viajes existentes.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 mb-4 leading-tight">
                Bienvenido a <span className="block mt-2">TravelSmart</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                Crea itinerarios de viaje{" "}
                <span className="font-medium text-gray-700">
                  personalizados con ayuda de IA.
                </span>
                <br className="hidden md:block" />
                Planifica tu viaje perfecto en minutos.
              </p>
            </>
          )}
        </header>

        {/* Main CTA Section */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-base font-semibold rounded-xl group text-white"
            >
              <Link href="/create" className="flex items-center gap-2">
                <span>Crear tu itinerario</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400 shadow-sm hover:shadow-md transition-all duration-300 px-7 py-4 text-sm font-medium rounded-xl"
            >
              <Link href="/itineraries">Ver mis itinerarios</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            ✨ Sin tarjeta de crédito requerida · Comienza gratis
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Feature Card 1 */}
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-cyan-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-sky-700 transition-colors duration-300">
                Impulsado por IA
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nuestra inteligencia artificial avanzada analiza tus
                preferencias y crea itinerarios únicos adaptados a tu estilo de
                viaje
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-cyan-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-sky-700 transition-colors duration-300">
                Rápido y fácil
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Genera itinerarios completos en minutos. Solo responde unas
                preguntas y deja que la IA haga el trabajo pesado por ti
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-cyan-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-sky-700 transition-colors duration-300">
                Planes detallados
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Obtén actividades día a día, recomendaciones de alojamiento,
                transporte y tips locales para cada destino
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MagicBento Section */}
      <div className="relative py-24 bg-palette-light-sky">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600 mb-4">
              Características Innovadoras
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Descubre todas las herramientas que hacen de TravelSmart la
              plataforma más completa para planificar tus viajes
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={false}
            spotlightRadius={300}
            particleCount={12}
            glowColor="14, 165, 233"
          />
        </div>
      </div>

      {/* Team Section */}
      <div className="relative py-24 bg-palette-light-sky">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-sky-200 shadow-sm mb-6">
              <span className="text-sm font-medium text-sky-600">
                👥 Nuestro Equipo
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600 mb-5">
              Las Mentes Detrás de TravelSmart
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Un equipo apasionado por la tecnología y los viajes, comprometido
              en crear la mejor experiencia de planificación para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-7xl mx-auto mb-16">
            <div className="flex justify-center">
              <ProfileCard
                size="sm"
                name="Santiago Spini"
                title="Software Engineer"
                handle="Sani Spini"
                status="Online"
                contactText="Hablemos!"
                avatarUrl="/avatars/santi_spini.png"
                grainUrl="/texture/grain.webp"
                iconUrl="/texture/iconpattern.png"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/santiagospini/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              />
            </div>
            <div className="flex justify-center">
              <ProfileCard
                size="sm"
                name="Santi Pedemonte"
                title="Software Engineer"
                handle="SPedemonte"
                status="Online"
                contactText="Hablemos!"
                avatarUrl="/avatars/spedemonte_avatar.png"
                grainUrl="/texture/grain.webp"
                iconUrl="/texture/iconpattern.png"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/santiagopedemonte/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              />
            </div>
            <div className="flex justify-center">
              <ProfileCard
                size="sm"
                name="Florencia Toledo"
                title="Project Manager"
                handle="Flor Toledo"
                status="Online"
                contactText="Hablemos!"
                avatarUrl="/avatars/flor_toledo.png"
                grainUrl="/texture/grain.webp"
                iconUrl="/texture/iconpattern.png"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/florencia-toledo-266753272/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              />
            </div>
          </div>

          {/* Call to Action Final */}
          <div className="text-center mt-16 pt-12 border-t border-sky-200 col-span-full">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              ¿Listo para comenzar tu próxima aventura?
            </h3>
            <p className="text-gray-600 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Únete a miles de viajeros que ya confían en TravelSmart para
              planificar sus experiencias inolvidables
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-10 py-6 text-lg font-semibold rounded-xl text-white"
            >
              <Link href="/create">Crear mi primer itinerario</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
