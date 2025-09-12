'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components';

export default function ItinerariesPage() {
  const { itineraries, loading, error } = useItinerary();
  const { fetchAllItineraries } = useItineraryActions();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    fetchAllItineraries();
  }, [isInitialized, isLoading, isAuthenticated, fetchAllItineraries]);

  // Show preload while auth is initializing/loading or itineraries are loading
  if (!isInitialized || isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus itinerarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No se pudieron cargar los itinerarios</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => fetchAllItineraries()}
                className="bg-sky-500 hover:bg-sky-700 rounded-full"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 pl-3">
                Itinerarios
              </h1>
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-sky-500 hover:bg-sky-700 rounded-full px-6">
              <Link href="/create">
                Crear nuevo itinerario
              </Link>
            </Button>
          </div>

          {/* Itineraries Grid */}
          {itineraries.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isAuthenticated ? 'Aún no hay itinerarios' : 'No hay itinerarios en esta sesión'}
              </h2>
              <p className="text-gray-600 mb-8">
                {isAuthenticated 
                  ? 'Comienza a planear tu próxima aventura creando tu primer itinerario.'
                  : '¡Comienza a planear tu próxima aventura! Tus itinerarios se guardarán para esta sesión.'
                }
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-amber-600 mb-6">
                  💡 Crea una cuenta para guardar tus itinerarios de forma permanente
                </p>
              )}
              <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-700 rounded-full px-8">
                <Link href="/create">
                  Crear tu primer itinerario
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <Link
                  key={itinerary.itinerary_id}
                  href={`/itinerary/${itinerary.itinerary_id}`}
                  className="group"
                >
                  <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow p-6 h-full border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {itinerary.trip_name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {itinerary.destination || itinerary.trip_name}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{itinerary.duration_days} días</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Creado el {new Date(itinerary.created_at).toLocaleDateString()}
                    </div>
                    
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 