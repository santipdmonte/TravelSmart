'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useItinerary } from '@/contexts/ItineraryContext';

export default function CreateItineraryPage() {
  const router = useRouter();
  const { loading, error } = useItinerary();
  const { createItinerary, clearError } = useItineraryActions();
  
  const [formData, setFormData] = useState({
    trip_name: '',
    duration_days: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trip_name.trim()) {
      return;
    }

    const itinerary = await createItinerary(formData);
    
    if (itinerary) {
      router.push(`/itinerary/${itinerary.itinerary_id}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_days' ? parseInt(value) || 1 : value,
    }));
    
    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Itinerary
            </h1>
            <p className="text-gray-600 mb-8">
              Tell us about your trip and we&apos;ll create a personalized itinerary for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Name */}
              <div>
                <label htmlFor="trip_name" className="block text-sm font-medium text-gray-800 mb-2">
                  Trip Destination
                </label>
                <input
                  type="text"
                  id="trip_name"
                  name="trip_name"
                  value={formData.trip_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Europe, Japan, New York"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-gray-800 placeholder-gray-500"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration_days" className="block text-sm font-medium text-gray-800 mb-2">
                  Trip Duration (days)
                </label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-gray-800"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.trip_name.trim()}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Itinerary...
                  </span>
                ) : (
                  'Generate Itinerary'
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about your destination (e.g., &quot;Southern Italy&quot; vs &quot;Italy&quot;)</li>
                <li>• Consider realistic trip durations for your destination</li>
                <li>• Our AI will create a detailed day-by-day itinerary for you</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 