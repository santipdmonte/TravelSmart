'use client';

import { useCallback } from 'react';
import { useItinerary } from '@/contexts/ItineraryContext';
import { generateItinerary, getItinerary, getSessionItineraries } from '@/lib/api';
import { GenerateItineraryRequest } from '@/types/itinerary';

export function useItineraryActions() {
  const { dispatch } = useItinerary();

  const createItinerary = useCallback(async (request: GenerateItineraryRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await generateItinerary(request);
      
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'ADD_ITINERARY', payload: response.data });
        dispatch({ type: 'SET_CURRENT_ITINERARY', payload: response.data });
        return response.data;
      }

      // If no data and no error, still need to stop loading
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create itinerary';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  }, [dispatch]);

  const fetchItinerary = useCallback(async (itineraryId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await getItinerary(itineraryId);
      
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'SET_CURRENT_ITINERARY', payload: response.data });
        return response.data;
      }

      // If no data and no error, still need to stop loading
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itinerary';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  }, [dispatch]);

  const fetchAllItineraries = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await getSessionItineraries();
      
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return [];
      }

      if (response.data) {
        dispatch({ type: 'SET_ITINERARIES', payload: response.data });
        return response.data;
      }

      // If no data and no error, still need to stop loading
      dispatch({ type: 'SET_LOADING', payload: false });
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itineraries';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return [];
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' });
  }, [dispatch]);

  return {
    createItinerary,
    fetchItinerary,
    fetchAllItineraries,
    clearError,
    clearState,
  };
} 