'use client';

import { useState } from 'react';
import { proposeItineraryChanges } from '@/lib/api';
import { Button } from './ui/button';

type Props = {
  itineraryId: string;
};

export default function PreviewAIChangesButton({ itineraryId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      // Phase 1: use a hardcoded instruction and just log the response
      const response = await proposeItineraryChanges(
        itineraryId,
        'Make my 7-day trip into a 9-day trip.'
      );
      console.log('AI Itinerary Diff Response:', response);
    } catch (err) {
      console.error('Failed to fetch AI changes preview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      {loading ? 'Loading preview…' : 'Preview AI Changes'}
    </Button>
  );
}
