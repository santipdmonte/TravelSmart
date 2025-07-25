'use client';

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
                Welcome back, <span className="text-indigo-700">{userDisplayName}</span>!
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Ready to plan your next adventure? Create a new itinerary or explore your existing trips.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                Welcome to <span className="text-indigo-700">TravelSmart</span>
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Create personalized travel itineraries with AI assistance. 
                Plan your perfect trip in minutes.
              </p>
            </>
          )}
        </header>

        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 px-8 py-4 text-lg">
            <Link href="/create">
              Create Your Itinerary
            </Link>
          </Button>
          
          <div className="mt-8">
            <Button asChild variant="link" className="text-indigo-600 hover:text-indigo-800">
              <Link href="/itineraries">
                View Your Itineraries →
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">AI-Powered</h3>
            <p className="text-gray-700">
              Our AI creates personalized itineraries based on your preferences
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Quick & Easy</h3>
            <p className="text-gray-700">
              Generate complete itineraries in minutes, not hours
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Detailed Plans</h3>
            <p className="text-gray-700">
              Get day-by-day activities and destination recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
