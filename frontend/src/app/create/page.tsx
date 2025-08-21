'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useItinerary } from '@/contexts/ItineraryContext';
import { GenerateItineraryRequest } from '@/types/itinerary';
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
  Textarea,
  Alert,
  AlertDescription
} from '@/components';

// Options
const WHEN_OPTIONS = [
  { key: 'winter', label: 'Winter (December to February)' },
  { key: 'spring', label: 'Spring (March to May)' },
  { key: 'summer', label: 'Summer (June to August)' },
  { key: 'fall',   label: 'Fall (September to November)' },
] as const;

const TRIP_TYPES = ['business','couples','friends','boys','girls','solo','family_teen','family_young_kids'] as const;
const OCCASIONS = ['anniversary','bachelorette','bachelor','birthday','graduation','honeymoon','spring_break','christmas','new_years'] as const;
const CITY_VIEWS = ['touristy','off_beaten','local'] as const;
const TRAVEL_STYLES = ['cultural','relaxing','adventurous','romantic','adrenaline'] as const;
const FOOD_PREFS = ['vegan','vegetarian','meat','pescatarian','gluten_free','budget','fine_dining'] as const;

// Simple chip button
function Chip({ active, children, onClick }: { active: boolean; children: any; onClick: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );
}

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
  preferences: z.object({
    when: z.enum(['winter','spring','summer','fall']).optional(),
    trip_type: z.enum(['business','couples','friends','boys','girls','solo','family_teen','family_young_kids']).optional(),
    occasion: z.enum(['anniversary','bachelorette','bachelor','birthday','graduation','honeymoon','spring_break','christmas','new_years']).optional(),
    city_view: z.enum(['touristy','off_beaten','local']).optional(),
    travel_styles: z.array(z.enum(['cultural','relaxing','adventurous','romantic','adrenaline'])).optional(),
    food_preferences: z.array(z.enum(['vegan','vegetarian','meat','pescatarian','gluten_free','budget','fine_dining'])).optional(),
    budget: z.number().positive().max(100000).optional(),
    budget_currency: z.literal('USD').optional(),
    notes: z.string().max(250).optional(),
  }).optional(),
});

type FormData = z.infer<typeof createItinerarySchema>;

export default function CreateItineraryPage() {
  const router = useRouter();
  const { loading, error } = useItinerary();
  const { createItinerary, clearError } = useItineraryActions();
  const [moreOpen, setMoreOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createItinerarySchema),
    defaultValues: {
      trip_name: '',
      duration_days: 7,
      preferences: {
        when: undefined,
        trip_type: undefined,
        occasion: undefined,
        city_view: undefined,
        travel_styles: [],
        food_preferences: [],
        budget: undefined,
        budget_currency: 'USD',
        notes: '',
      }
    },
    mode: 'onSubmit', // Only validate on submit, not while typing
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Clear any previous errors
      if (error) {
        clearError();
      }
      // Clean optional preferences (remove empty values)
      const prefs = data.preferences || {};
      const cleanedEntries = Object.entries(prefs).filter(([_, v]) => {
        if (v === undefined || v === null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return v.trim().length > 0;
        return true;
      });
      const cleanedPreferences = cleanedEntries.reduce((acc, [k, v]) => {
        // preserve values as is
        // @ts-ignore - dynamic index
        acc[k] = v;
        return acc;
      }, {} as Record<string, any>);

      const request: GenerateItineraryRequest = {
        trip_name: data.trip_name,
        duration_days: data.duration_days,
        ...(Object.keys(cleanedPreferences).length ? { preferences: cleanedPreferences as any } : {}),
      };

      const itinerary = await createItinerary(request);
      
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

                {/* More options toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(v => !v)}
                    className="text-gray-800 font-medium flex items-center gap-2"
                  >
                    {moreOpen ? '▾ See less' : '▸ See more'}
                    <span className="text-sm text-gray-500">(answer as little as you want)</span>
                  </button>
                </div>

                {moreOpen && (
                  <div className="space-y-8 pt-2">
                    {/* When are you going? (single-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.when"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">When are you going?</FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {WHEN_OPTIONS.map(opt => (
                              <Chip key={opt.key} active={field.value === opt.key} onClick={() => field.onChange(opt.key)}>
                                {opt.label}
                              </Chip>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Trip type (single-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.trip_type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">What&apos;s the type of your trip?</FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {TRIP_TYPES.map(key => (
                              <Chip key={key} active={field.value === key} onClick={() => field.onChange(key)}>
                                {key.replace(/_/g, ' ')}
                              </Chip>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Occasion (single-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.occasion"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">What&apos;s the occasion?</FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {OCCASIONS.map(key => (
                              <Chip key={key} active={field.value === key} onClick={() => field.onChange(key)}>
                                {key.replace(/_/g, ' ')}
                              </Chip>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* City view (single-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.city_view"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">How do you want to see the city?</FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {CITY_VIEWS.map(key => (
                              <Chip key={key} active={field.value === key} onClick={() => field.onChange(key)}>
                                {key.replace(/_/g, ' ')}
                              </Chip>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Travel style (multi-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.travel_styles"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">What is your travel style? <span className="text-sm text-gray-500">(select all that apply)</span></FormLabel>
                            {Array.isArray(field.value) && field.value.length > 0 && (
                              <button
                                type="button"
                                onClick={() => field.onChange([])}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {TRAVEL_STYLES.map(key => {
                              const active = (field.value ?? []).includes(key);
                              return (
                                <Chip
                                  key={key}
                                  active={active}
                                  onClick={() => {
                                    const set = new Set(field.value ?? []);
                                    active ? set.delete(key) : set.add(key);
                                    field.onChange(Array.from(set));
                                  }}
                                >
                                  {key.replace(/_/g, ' ')}
                                </Chip>
                              );
                            })}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Food preferences (multi-select) */}
                    <FormField
                      control={form.control}
                      name="preferences.food_preferences"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">What are your food preferences? <span className="text-sm text-gray-500">(select all that apply)</span></FormLabel>
                            {Array.isArray(field.value) && field.value.length > 0 && (
                              <button
                                type="button"
                                onClick={() => field.onChange([])}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {FOOD_PREFS.map(key => {
                              const active = (field.value ?? []).includes(key);
                              return (
                                <Chip
                                  key={key}
                                  active={active}
                                  onClick={() => {
                                    const set = new Set(field.value ?? []);
                                    active ? set.delete(key) : set.add(key);
                                    field.onChange(Array.from(set));
                                  }}
                                >
                                  {key.replace(/_/g, ' ')}
                                </Chip>
                              );
                            })}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferences.budget"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormLabel className="text-gray-800">Budget (USD)</FormLabel>
                              {field.value !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(undefined)}
                                  className="text-sm text-gray-500 hover:underline"
                                >
                                  clear
                                </button>
                              )}
                            </div>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 300"
                                disabled={loading}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Per person with currency for the entire trip</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Hidden/default currency field to keep contract clear */}
                      <FormField
                        control={form.control}
                        name="preferences.budget_currency"
                        render={({ field }) => (
                          <input type="hidden" value={field.value ?? 'USD'} readOnly />
                        )}
                      />
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="preferences.notes"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">Anything else you&apos;d like to add?</FormLabel>
                            {(field.value ?? '').length > 0 && (
                              <button
                                type="button"
                                onClick={() => field.onChange('')}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                clear
                              </button>
                            )}
                          </div>
                          <FormControl>
                            <Textarea
                              maxLength={250}
                              placeholder="Ex: I want more water sports, or I'd like to use a car to go around"
                              disabled={loading}
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

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