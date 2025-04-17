import { ViajeState, ViajeStateInput } from '../types/travel';
import { createTravelPlanMock } from './mockTravelService';

// API URL should be in an environment variable in a production app
const API_URL = 'http://localhost:8000'; // Replace with your actual API URL

// Set to true to use the mock service, false to use the actual API
const USE_MOCK = true;

export const createTravelPlan = async (input: ViajeStateInput): Promise<ViajeState> => {
  // Use mock service for development/testing
  if (USE_MOCK) {
    return createTravelPlanMock(input);
  }
  
  // Use actual API
  try {
    const response = await fetch(`${API_URL}/create-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating travel plan:', error);
    throw error;
  }
}; 