'use client';

import { useCallback } from 'react';
import { useChat } from '@/contexts/AgentContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { initializeAgent, sendAgentMessage, getAgentState } from '@/lib/agentApi';

export function useChatActions() {
  const { dispatch } = useChat();
  const { fetchItinerary } = useItineraryActions();

  const openChat = useCallback(async (itineraryId: string) => {
    // Open chat immediately and show initializing state
    dispatch({ type: 'OPEN_CHAT' });
    dispatch({ type: 'SET_INITIALIZING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Clear any existing state if switching to a different itinerary
    dispatch({ type: 'CLEAR_CHAT' });
    dispatch({ type: 'OPEN_CHAT' });
    dispatch({ type: 'SET_INITIALIZING', payload: true });
    dispatch({ type: 'SET_THREAD_ID', payload: itineraryId });

    try {
      // Try to get existing agent state first
      const existingState = await getAgentState(itineraryId);
      
      if (existingState.data && existingState.data.messages.length > 0) {
        // Use existing chat history
        dispatch({ type: 'SET_AGENT_STATE', payload: existingState.data });
      } else {
        // Initialize new agent
        const response = await initializeAgent(itineraryId);
        
        if (response.error) {
          dispatch({ type: 'SET_ERROR', payload: response.error });
          return false;
        }

        if (response.data) {
          dispatch({ type: 'SET_AGENT_STATE', payload: response.data });
        }
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open chat';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch]);

  const sendMessage = useCallback(async (itineraryId: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_HIL_STATE', payload: null }); // Clear any pending HIL state

    try {
      // Add user message to UI immediately
      const userMessage = {
        content: message,
        type: 'human' as const,
        id: crypto.randomUUID(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // Set loading state AFTER adding user message
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await sendAgentMessage(itineraryId, message);
      
      if (response.error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return false;
      }

      if (response.data) {
        const { agentState, hilResponse } = response.data;
        
        // Update with complete agent state (includes AI response) - this will set loading to false
        dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
        
        // Handle HIL response
        if (hilResponse.isHIL) {
          dispatch({ type: 'SET_HIL_STATE', payload: hilResponse });
        } else {
          // Check if the itinerary was updated and refresh it
          const currentAgentItinerary = agentState.itinerary;
          if (currentAgentItinerary) {
            // Refetch the full itinerary to get the latest version
            await fetchItinerary(itineraryId);
          }
        }
        
        return true;
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch, fetchItinerary]);

  const confirmChanges = useCallback(async (itineraryId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await sendAgentMessage(itineraryId, 's');
      
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return false;
      }

      if (response.data) {
        const { agentState } = response.data;
        
        // Update with complete agent state
        dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
        dispatch({ type: 'SET_HIL_STATE', payload: null }); // Clear HIL state
        
        // Refresh the itinerary since changes were confirmed
        await fetchItinerary(itineraryId);
        
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm changes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch, fetchItinerary]);

  const cancelChanges = useCallback(async (itineraryId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await sendAgentMessage(itineraryId, 'El usuario no acepto los cambios sugeridos');
      
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return false;
      }

      if (response.data) {
        const { agentState } = response.data;
        
        // Update with complete agent state
        dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
        dispatch({ type: 'SET_HIL_STATE', payload: null }); // Clear HIL state
        
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel changes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch]);

  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, [dispatch]);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  return {
    openChat,
    sendMessage,
    confirmChanges,
    cancelChanges,
    closeChat,
    clearChat,
    clearError,
  };
} 