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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchAllItineraries();
  }, [fetchAllItineraries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Itineraries</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => fetchAllItineraries()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isAuthenticated ? 'Your Itineraries' : 'Session Itineraries'}
              </h1>
              <p className="text-gray-600">
                {itineraries.length} {itineraries.length === 1 ? 'itinerary' : 'itineraries'} 
                {isAuthenticated ? ' in your account' : ' in this session'}
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-amber-600 mt-1">
                  💡 Sign in to save your itineraries permanently and access them from any device
                </p>
              )}
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/create">
                Create New Itinerary
              </Link>
            </Button>
          </div>

          {/* Itineraries Grid */}
          {itineraries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isAuthenticated ? 'No Itineraries Yet' : 'No Session Itineraries'}
              </h2>
              <p className="text-gray-600 mb-8">
                {isAuthenticated 
                  ? 'Start planning your next adventure by creating your first itinerary.'
                  : 'Start planning your next adventure! Your itineraries will be saved for this session.'
                }
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-amber-600 mb-6">
                  💡 Create an account to save your itineraries permanently
                </p>
              )}
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/create">
                  Create Your First Itinerary
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
                  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {itinerary.trip_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        itinerary.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {itinerary.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {itinerary.destination || itinerary.trip_name}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{itinerary.duration_days} days</span>
                      <span>{itinerary.trip_type || 'Travel'}</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Created {new Date(itinerary.created_at).toLocaleDateString()}
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {itinerary.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
                        </span>
                        <span className="text-indigo-600 font-medium">
                          View Details →
                        </span>
                      </div>
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