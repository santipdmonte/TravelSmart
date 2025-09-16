'use client';

import { useCallback } from 'react';
import { useChat } from '@/contexts/AgentContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { sendAgentMessage, getAgentState, sendAgentMessageStream, getAgentStateWithHIL } from '@/lib/agentApi';
import { useSidebar } from '@/components/ui/sidebar';

export function useChatActions() {
  const { dispatch } = useChat();
  const { fetchItinerary } = useItineraryActions();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const openChat = useCallback(async (itineraryId: string) => {
    // Open chat immediately and show initializing state
    dispatch({ type: 'OPEN_CHAT' });
    dispatch({ type: 'SET_INITIALIZING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Close sidebar if open (desktop and mobile)
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }

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
        // No history yet; backend will initialize on first message
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open chat';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch, isMobile, setOpen, setOpenMobile]);

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

      // Create a placeholder AI message to stream into
      const aiMessageId = crypto.randomUUID();
      const aiMessage = {
        content: '',
        type: 'ai' as const,
        id: aiMessageId,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

      // Set loading state AFTER adding messages
      dispatch({ type: 'SET_LOADING', payload: true });

      // Stream tokens
      let firstTokenSeen = false;
      const streamResult = await sendAgentMessageStream(
        itineraryId,
        itineraryId,
        message,
        (token: string) => {
          if (!firstTokenSeen) {
            firstTokenSeen = true;
            // Hide loading indicator once tokens start arriving
            dispatch({ type: 'SET_LOADING', payload: false });
          }
          dispatch({ type: 'APPEND_MESSAGE_CONTENT', payload: { messageId: aiMessageId, content: token } });
        }
      );

      if (streamResult.error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: streamResult.error });
        return false;
      }

      // After stream completion, fetch latest agent state + HIL
      const stateResult = await getAgentStateWithHIL(itineraryId);
      if (stateResult.error || !stateResult.data) {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: stateResult.error || 'Failed to fetch agent state' });
        return false;
      }

      const { agentState, hilResponse } = stateResult.data;
      dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
      if (hilResponse.isHIL) {
        dispatch({ type: 'SET_HIL_STATE', payload: hilResponse });
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch, fetchItinerary]);

  const confirmChanges = useCallback(async (itineraryId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Add feedback message immediately when user clicks confirm
    const successMessage = {
      content: "✅ Changes confirmed successfully! Your itinerary has been updated.",
      type: 'ai' as const,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
    
    // Clear HIL state immediately to remove the confirmation UI
    dispatch({ type: 'SET_HIL_STATE', payload: null });
    
    // Set loading state to show AI thinking
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Placeholder streamed AI response after confirmation
      const aiMessageId = crypto.randomUUID();
      dispatch({ type: 'ADD_MESSAGE', payload: { id: aiMessageId, type: 'ai' as const, content: '' } });

      let firstTokenSeen = false;
      const streamResult = await sendAgentMessageStream(
        itineraryId,
        itineraryId,
        's',
        (token: string) => {
          if (!firstTokenSeen) {
            firstTokenSeen = true;
            dispatch({ type: 'SET_LOADING', payload: false });
          }
          dispatch({ type: 'APPEND_MESSAGE_CONTENT', payload: { messageId: aiMessageId, content: token } });
        }
      );

      if (streamResult.error) {
        dispatch({ type: 'SET_ERROR', payload: streamResult.error });
        return false;
      }

      const stateResult = await getAgentStateWithHIL(itineraryId);
      if (stateResult.error || !stateResult.data) {
        dispatch({ type: 'SET_ERROR', payload: stateResult.error || 'Failed to fetch agent state' });
        return false;
      }

      const { agentState } = stateResult.data;
      dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
      await fetchItinerary(itineraryId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm changes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [dispatch, fetchItinerary]);

  const cancelChanges = useCallback(async (itineraryId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Add feedback message immediately when user clicks cancel
    const cancelMessage = {
      content: "❌ Changes cancelled. Your itinerary remains unchanged.",
      type: 'ai' as const,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: cancelMessage });
    
    // Clear HIL state immediately to remove the confirmation UI
    dispatch({ type: 'SET_HIL_STATE', payload: null });
    
    // Set loading state to show AI thinking
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Placeholder streamed AI response after cancellation
      const aiMessageId = crypto.randomUUID();
      dispatch({ type: 'ADD_MESSAGE', payload: { id: aiMessageId, type: 'ai' as const, content: '' } });

      let firstTokenSeen = false;
      const streamResult = await sendAgentMessageStream(
        itineraryId,
        itineraryId,
        'El usuario no acepto los cambios sugeridos',
        (token: string) => {
          if (!firstTokenSeen) {
            firstTokenSeen = true;
            dispatch({ type: 'SET_LOADING', payload: false });
          }
          dispatch({ type: 'APPEND_MESSAGE_CONTENT', payload: { messageId: aiMessageId, content: token } });
        }
      );

      if (streamResult.error) {
        dispatch({ type: 'SET_ERROR', payload: streamResult.error });
        return false;
      }

      const stateResult = await getAgentStateWithHIL(itineraryId);
      if (stateResult.error || !stateResult.data) {
        dispatch({ type: 'SET_ERROR', payload: stateResult.error || 'Failed to fetch agent state' });
        return false;
      }

      const { agentState } = stateResult.data;
      dispatch({ type: 'SET_AGENT_STATE', payload: agentState });
      return true;
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