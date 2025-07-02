'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatPanel } from '@/components/chat';

export default function ItineraryDetailsPage() {
  const params = useParams();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { openChat, closeChat } = useChatActions();

  const itineraryId = params.id as string;

  useEffect(() => {
    if (itineraryId) {
      fetchItinerary(itineraryId);
    }
  }, [itineraryId, fetchItinerary]);

  // Close chat if it's open for a different itinerary
  useEffect(() => {
    if (isChatOpen && threadId && threadId !== itineraryId) {
      closeChat();
    }
  }, [itineraryId, isChatOpen, threadId, closeChat]);

  // Cleanup: Close chat when leaving the page
  useEffect(() => {
    return () => {
      if (isChatOpen) {
        closeChat();
      }
    };
  }, [isChatOpen, closeChat]);

  const handleEditWithAI = async () => {
    if (itineraryId) {
      await openChat(itineraryId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link
              href="/itineraries"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Itineraries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary Not Found</h2>
            <p className="text-gray-700 mb-6">The itinerary you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/itineraries"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Itineraries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { details_itinerary } = currentItinerary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isChatOpen ? 'lg:mr-[33.333333%]' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/itineraries"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Itineraries
            </Link>
          </div>

          {/* Itinerary Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {details_itinerary.nombre_viaje}
                </h1>
                <p className="text-gray-700 mb-4">
                  {details_itinerary.destino_general} • {details_itinerary.cantidad_dias} days
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>Status: {currentItinerary.status}</span>
                  <span>•</span>
                  <span>Created: {new Date(currentItinerary.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Edit with AI Button */}
              <div className="mt-4 md:mt-0 md:ml-6">
                <button
                  onClick={handleEditWithAI}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Edit with AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-8">
            {details_itinerary.destinos.map((destination, destIndex) => (
              <div key={destIndex} className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {destination.nombre_destino}
                </h2>
                <p className="text-gray-700 mb-6">
                  {destination.cantidad_dias_en_destino} days in this destination
                </p>

                {/* Days */}
                <div className="space-y-4">
                  {destination.dias_destino.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-l-4 border-indigo-200 pl-6 py-4"
                    >
                      <div className="flex items-center mb-2">
                        <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3">
                          {day.posicion_dia}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Day {day.posicion_dia}
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-11">
                        {day.actividades}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 text-center">
            <Link
              href="/create"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Another Itinerary
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Panel - Fixed positioned */}
      <ChatPanel />
    </div>
  );
} 