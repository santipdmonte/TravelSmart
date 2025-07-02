import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-indigo-600">TravelSmart</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create personalized travel itineraries with AI assistance. 
            Plan your perfect trip in minutes.
          </p>
        </header>

        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <Link
            href="/create"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create Your Itinerary
          </Link>
          
          <div className="mt-8">
            <Link
              href="/itineraries"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Your Itineraries →
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Our AI creates personalized itineraries based on your preferences
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
            <p className="text-gray-600">
              Generate complete itineraries in minutes, not hours
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Detailed Plans</h3>
            <p className="text-gray-600">
              Get day-by-day activities and destination recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
