'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useItinerary } from '@/contexts/ItineraryContext';
import { 
  Button, 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription,
  Input,
  Alert,
  AlertDescription
} from '@/components';

// Form validation schema
const createItinerarySchema = z.object({
  trip_name: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must be less than 100 characters')
    .trim(),
  duration_days: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Please enter a valid number',
    })
    .min(1, 'Duration must be at least 1 day')
    .max(30, 'Duration cannot exceed 30 days')
    .int('Duration must be a whole number'),
});

type FormData = z.infer<typeof createItinerarySchema>;

export default function CreateItineraryPage() {
  const router = useRouter();
  const { loading, error } = useItinerary();
  const { createItinerary, clearError } = useItineraryActions();

  const form = useForm<FormData>({
    resolver: zodResolver(createItinerarySchema),
    defaultValues: {
      trip_name: '',
      duration_days: 7,
    },
    mode: 'onSubmit', // Only validate on submit, not while typing
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Clear any previous errors
      if (error) {
        clearError();
      }

      const itinerary = await createItinerary(data);
      
      if (itinerary) {
        router.push(`/itinerary/${itinerary.itinerary_id}`);
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
    }
  };

  // Clear server errors when user starts typing
  form.watch();
  if (error && (form.formState.dirtyFields.trip_name || form.formState.dirtyFields.duration_days)) {
    clearError();
  }

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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Trip Destination Field */}
                <FormField
                  control={form.control}
                  name="trip_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Trip Destination</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Europe, Japan, New York"
                          className="text-lg h-12 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={loading}
                          {...field}
                          onChange={(e) => {
                            // Clear any previous form errors when user starts typing
                            if (form.formState.errors.trip_name) {
                              form.clearErrors('trip_name');
                            }
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific about your destination for better results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration Field */}
                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Trip Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          placeholder="Enter number of days"
                          className="text-lg h-12 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={loading}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            
                            // Clear any previous form errors when user starts typing
                            if (form.formState.errors.duration_days) {
                              form.clearErrors('duration_days');
                            }
                            
                            if (value === '') {
                              // Set to empty string for display, form validation will handle this on submit
                              field.onChange('');
                            } else {
                              const numValue = parseInt(value, 10);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              } else {
                                // Keep the input value for partial typing
                                field.onChange(value);
                              }
                            }
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a realistic duration for your destination (1-30 days)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Server Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 py-3 transition-all duration-200"
                  size="lg"
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
                </Button>
              </form>
            </Form>

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