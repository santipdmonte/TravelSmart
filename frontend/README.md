# TravelSmart Frontend

A Next.js application for creating AI-powered travel itineraries.

## Features

- **AI-Powered Itinerary Generation**: Create personalized travel plans with AI assistance
- **Session-Based Tracking**: No authentication required - uses session IDs to track user itineraries
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Modern React Patterns**: Uses React Context for state management and custom hooks

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create itinerary page
│   ├── itinerary/[id]/    # Individual itinerary details
│   ├── itineraries/       # All user itineraries
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API functions
└── types/                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
# Mapbox (required for route map)
# Prefer this variable name:
NEXT_PUBLIC_MAPBOX_API_TOKEN=pk.YOUR_PUBLIC_TOKEN
# Also supported as fallback:
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.YOUR_PUBLIC_TOKEN
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration

The frontend communicates with a backend API with the following endpoints:

- `POST /api/itineraries/generate` - Generate new itinerary
- `GET /api/itineraries/{itinerary_id}` - Get specific itinerary
- `GET /api/itineraries/{session_id}` - Get all session itineraries

### Session Management

The app uses session IDs stored in localStorage to track user itineraries without requiring authentication. Each API request includes an `X-Session-ID` header.

## State Management

The application uses React Context for state management:

- **ItineraryContext**: Manages itinerary data, loading states, and errors
- **useItineraryActions**: Custom hook for API operations
- **useItinerary**: Hook to access itinerary state

## Key Components

### Pages
- **Landing Page** (`/`): Welcome page with navigation to other sections
- **Create Page** (`/create`): Form to generate new itineraries
- **Itineraries Page** (`/itineraries`): List of all user itineraries
- **Itinerary Details** (`/itinerary/[id]`): Detailed view of a specific itinerary

### Utilities
- **API Client** (`lib/api.ts`): Centralized API communication
- **Utils** (`lib/utils.ts`): Common utility functions
- **Types** (`types/itinerary.ts`): TypeScript definitions

## Development Guidelines

- Use TypeScript for all new files
- Follow the established folder structure
- Use the custom hooks for API operations
- Implement proper error handling and loading states
- Use Tailwind CSS for styling
- Follow React best practices and hooks patterns

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: http://localhost:8001)
- `NEXT_PUBLIC_MAPBOX_API_TOKEN` (or `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`): Mapbox public access token used on the client

Notes:
- When you change `.env.local`, you must stop and restart `npm run dev` so Next.js reloads env vars.
- Do not wrap values in quotes in `.env.local`. If you did, remove the quotes or we try to strip them.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **HTTP Client**: Fetch API
- **Development**: ESLint, Turbopack

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
