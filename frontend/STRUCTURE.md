# TravelSmart Frontend - Project Structure

## Overview

This is a Next.js 15 application built with TypeScript and Tailwind CSS for creating AI-powered travel itineraries. The project follows modern React patterns and best practices.

## Architecture Decisions

### 1. **Next.js App Router**
- Using the new App Router (Next.js 13+) for better performance and developer experience
- File-based routing with dynamic routes for itinerary details
- Server-side rendering capabilities for better SEO

### 2. **State Management**
- **React Context + useReducer**: Chosen for its simplicity and built-in React patterns
- **Custom Hooks**: Encapsulate business logic and API calls
- **No external state library**: Keeps dependencies minimal for this scope

### 3. **Session-Based Authentication**
- Uses localStorage to store session IDs
- No user authentication required for MVP
- Session ID sent via `X-Session-ID` header to backend

### 4. **TypeScript Integration**
- Full type safety throughout the application
- Strongly typed API responses and state management
- Better developer experience and fewer runtime errors

## File Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── create/            # Create itinerary page
│   │   │   └── page.tsx
│   │   ├── itinerary/
│   │   │   └── [id]/          # Dynamic route for itinerary details
│   │   │       └── page.tsx
│   │   ├── itineraries/       # List all itineraries
│   │   │   └── page.tsx
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ErrorMessage.tsx   # Error display component
│   │   └── LoadingSpinner.tsx # Loading indicator
│   │
│   ├── contexts/              # React Context providers
│   │   └── ItineraryContext.tsx # Global state management
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useItineraryActions.ts # API operations hook
│   │
│   ├── lib/                   # Utility functions and configurations
│   │   ├── api.ts             # API client and endpoints
│   │   └── utils.ts           # Common utility functions
│   │
│   └── types/                 # TypeScript type definitions
│       └── itinerary.ts       # Itinerary-related types
│
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
└── README.md                 # Project documentation
```

## Key Components

### Pages
1. **Landing Page** (`/`)
   - Welcome screen with feature highlights
   - Navigation to create and view itineraries

2. **Create Page** (`/create`)
   - Form to input trip details
   - Calls AI generation API
   - Redirects to generated itinerary

3. **Itineraries List** (`/itineraries`)
   - Displays all user itineraries
   - Card-based layout with preview information
   - Links to detailed views

4. **Itinerary Details** (`/itinerary/[id]`)
   - Full itinerary display
   - Day-by-day breakdown
   - Destination-based organization

### State Management
- **ItineraryContext**: Centralized state for all itinerary data
- **useItineraryActions**: Custom hook for API operations
- **Reducer Pattern**: Predictable state updates

### API Integration
- **Centralized API Client**: Single source for all API calls
- **Error Handling**: Consistent error handling across the app
- **Session Management**: Automatic session ID handling

## Development Patterns

### 1. **Component Structure**
- Functional components with hooks
- TypeScript interfaces for all props
- Consistent error and loading states

### 2. **State Management Flow**
```
User Action → Hook Function → API Call → Context Update → UI Re-render
```

### 3. **Error Handling**
- API errors captured and displayed consistently
- Loading states for better UX
- Graceful fallbacks for missing data

### 4. **Styling Approach**
- Tailwind CSS for utility-first styling
- Consistent color scheme and spacing
- Responsive design patterns

## API Endpoints Used

1. **POST /api/itineraries/generate**
   - Input: `{ trip_name: string, duration_days: number }`
   - Output: Complete itinerary object

2. **GET /api/itineraries/{itinerary_id}**
   - Fetch specific itinerary by ID

3. **GET /api/itineraries/{session_id}**
   - Fetch all itineraries for current session

## Environment Configuration

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (default: http://localhost:8001)

## Build and Deployment

- **Development**: `npm run dev` with Turbopack
- **Production**: `npm run build` creates optimized bundle
- **Type Checking**: `npm run type-check` validates TypeScript
- **Linting**: `npm run lint` ensures code quality

## Future Enhancements

This structure supports easy extension for:
- User authentication system
- Itinerary editing capabilities
- Social sharing features
- Advanced filtering and search
- Mobile app development 