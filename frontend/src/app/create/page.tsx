"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
// import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useItinerary } from "@/contexts/ItineraryContext";
import { GenerateItineraryRequest } from "@/types/itinerary";
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
  AlertDescription,
} from "@/components";

// Opciones
const WHEN_OPTIONS = [
  { key: "winter", label: "Invierno" },
  { key: "spring", label: "Primavera" },
  { key: "summer", label: "Verano" },
  { key: "fall", label: "Otoño" },
] as const;

const TRIP_TYPES = [
  "business",
  "couples",
  "friends",
  "boys",
  "girls",
  "solo",
  "family_teen",
  "family_young_kids",
] as const;
const OCCASIONS = [
  "anniversary",
  "bachelorette",
  "bachelor",
  "birthday",
  "graduation",
  "honeymoon",
  "spring_break",
  "christmas",
  "new_years",
] as const;
const CITY_VIEWS = ["touristy", "off_beaten", "local"] as const;
const TRAVEL_STYLES = [
  "cultural",
  "relaxing",
  "adventurous",
  "romantic",
  "adrenaline",
  "gastronomic",
  "festive",
] as const;
const FOOD_PREFS = [
  "vegan",
  "vegetarian",
  "meat",
  "pescatarian",
  "gluten_free",
  "budget",
  "fine_dining",
] as const;

const TRIP_TYPE_LABELS: Record<(typeof TRIP_TYPES)[number], string> = {
  business: "Viaje de negocios",
  couples: "Viaje en pareja",
  friends: "Viaje con amigos",
  boys: "Viaje de chicos",
  girls: "Viaje de chicas",
  solo: "Viaje en solitario",
  family_teen: "Familia (adolescentes/adultos)",
  family_young_kids: "Familia (niños pequeños)",
};

const OCCASION_LABELS: Record<(typeof OCCASIONS)[number], string> = {
  anniversary: "Aniversario",
  bachelorette: "Despedida de soltera",
  bachelor: "Despedida de soltero",
  birthday: "Cumpleaños",
  graduation: "Graduación",
  honeymoon: "Luna de miel",
  spring_break: "Receso de primavera",
  christmas: "Navidad",
  new_years: "Año nuevo",
};

const CITY_VIEW_LABELS: Record<(typeof CITY_VIEWS)[number], string> = {
  touristy: "Turístico",
  off_beaten: "Fuera de lo común",
  local: "Como un local",
};

const TRAVEL_STYLE_LABELS: Record<(typeof TRAVEL_STYLES)[number], string> = {
  cultural: "Cultural",
  relaxing: "Relajado",
  adventurous: "Aventurero",
  romantic: "Romántico",
  adrenaline: "Adrenalina",
  gastronomic: "Gastronómico",
  festive: "Festivo",
};

const FOOD_PREF_LABELS: Record<(typeof FOOD_PREFS)[number], string> = {
  vegan: "Vegano",
  vegetarian: "Vegetariano",
  meat: "Amante de la carne",
  pescatarian: "Pescetariano",
  gluten_free: "Sin gluten",
  budget: "Económico",
  fine_dining: "Alta cocina",
};

// Simple chip button
function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm border transition-colors shadow-sm ${
        active
          ? "bg-sky-500 text-white border-sky-500 hover:bg-sky-600"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow"
      }`}
    >
      {children}
    </button>
  );
}

// Esquema de validación
const createItinerarySchema = z.object({
  trip_name: z
    .string()
    .min(2, "El destino debe tener al menos 2 caracteres")
    .max(100, "El destino debe tener menos de 100 caracteres")
    .trim(),
  duration_days: z
    .number({
      required_error: "La duración es obligatoria",
      invalid_type_error: "Ingresa un número válido (1-30)",
    })
    .min(1, "La duración debe ser de al menos 1 día")
    .max(30, "La duración no puede superar 30 días")
    .int("La duración debe ser un número entero"),
  preferences: z
    .object({
      when: z.enum(["winter", "spring", "summer", "fall"]).optional(),
      trip_type: z
        .enum([
          "business",
          "couples",
          "friends",
          "boys",
          "girls",
          "solo",
          "family_teen",
          "family_young_kids",
        ])
        .optional(),
      occasion: z
        .enum([
          "anniversary",
          "bachelorette",
          "bachelor",
          "birthday",
          "graduation",
          "honeymoon",
          "spring_break",
          "christmas",
          "new_years",
        ])
        .optional(),
      city_view: z.enum(["touristy", "off_beaten", "local"]).optional(),
      travel_styles: z
        .array(
          z.enum([
            "cultural",
            "relaxing",
            "adventurous",
            "romantic",
            "adrenaline",
            "gastronomic",
            "festive",
          ])
        )
        .optional(),
      food_preferences: z
        .array(
          z.enum([
            "vegan",
            "vegetarian",
            "meat",
            "pescatarian",
            "gluten_free",
            "budget",
            "fine_dining",
          ])
        )
        .optional(),
      budget: z.number().positive().max(100000).optional(),
      budget_currency: z.literal("USD").optional(),
      notes: z.string().max(250).optional(),
    })
    .optional(),
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
      trip_name: "",
      duration_days: 7,
      preferences: {
        when: undefined,
        trip_type: undefined,
        occasion: undefined,
        city_view: undefined,
        travel_styles: [],
        food_preferences: [],
        budget: undefined,
        budget_currency: "USD",
        notes: "",
      },
    },
    mode: "onSubmit", // Only validate on submit, not while typing
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Clear any previous errors
      if (error) {
        clearError();
      }
      // Clean optional preferences (remove empty values)
      const prefs = data.preferences || {};
      const cleanedEntries = Object.entries(prefs).filter(([, v]) => {
        if (v === undefined || v === null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim().length > 0;
        return true;
      });
      const cleanedPreferences = cleanedEntries.reduce<Record<string, unknown>>(
        (acc, [k, v]) => {
          // preserve values as is
          (acc as Record<string, unknown>)[k] = v as unknown;
          return acc;
        },
        {}
      );

      const request: GenerateItineraryRequest = {
        trip_name: data.trip_name,
        duration_days: data.duration_days,
        ...(Object.keys(cleanedPreferences).length
          ? { preferences: cleanedPreferences }
          : {}),
      };

      const itinerary = await createItinerary(request);

      if (itinerary) {
        router.push(`/itinerary/${itinerary.itinerary_id}`);
      }
    } catch (error) {
      console.error("Error creating itinerary:", error);
    }
  };

  // Clear server errors when user starts typing
  form.watch();
  if (
    error &&
    (form.formState.dirtyFields.trip_name ||
      form.formState.dirtyFields.duration_days)
  ) {
    clearError();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 pl-3">
              Crea tu itinerario
            </h1>
            <p className="text-gray-600 mb-8 pl-3">
              Cuéntanos sobre tu viaje y crearemos un itinerario personalizado
              para ti.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Trip Destination Field */}
                <FormField
                  control={form.control}
                  name="trip_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pl-3 pb-1 text-gray-800">
                        Destino
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="¿Donde quieres ir?"
                          className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-rose-500 focus:border-rose-500 placeholder:text-gray-400"
                          disabled={loading}
                          {...field}
                          onChange={(e) => {
                            // Clear any previous form errors when user starts typing
                            if (form.formState.errors.trip_name) {
                              form.clearErrors("trip_name");
                            }
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
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
                      <FormLabel className="pl-3 pb-1 text-gray-800">
                        Duración
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          placeholder="¿Cuántos días?"
                          className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-rose-500 focus:border-rose-500 placeholder:text-gray-400"
                          disabled={loading}
                          // value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Clear any previous form errors when user starts typing
                            if (form.formState.errors.duration_days) {
                              form.clearErrors("duration_days");
                            }

                            if (value === "") {
                              // Set to empty string for display, form validation will handle this on submit
                              field.onChange("");
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* More options toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMoreOpen((v) => !v)}
                    className="text-yellow-500 font-medium flex items-center gap-2 hover:underline pl-3"
                  >
                    {moreOpen ? "▾ Menos opciones" : "▸ Más opciones"}
                    <span className="text-sm text-yellow-500">
                      (responde tanto o tan poco como quieras)
                    </span>
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
                            <FormLabel className="text-gray-800">
                              ¿Cuándo vas?
                            </FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                              >
                                limpiar
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {WHEN_OPTIONS.map((opt) => (
                              <Chip
                                key={opt.key}
                                active={field.value === opt.key}
                                onClick={() => field.onChange(opt.key)}
                              >
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
                            <FormLabel className="text-gray-800">
                              ¿Cuál es el tipo de tu viaje?
                            </FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                              >
                                limpiar
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {TRIP_TYPES.map((key) => (
                              <Chip
                                key={key}
                                active={field.value === key}
                                onClick={() => field.onChange(key)}
                              >
                                {TRIP_TYPE_LABELS[key]}
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
                            <FormLabel className="text-gray-800">
                              ¿Cuál es la ocasión?
                            </FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                              >
                                limpiar
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {OCCASIONS.map((key) => (
                              <Chip
                                key={key}
                                active={field.value === key}
                                onClick={() => field.onChange(key)}
                              >
                                {OCCASION_LABELS[key]}
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
                            <FormLabel className="text-gray-800">
                              ¿Cómo quieres ver la ciudad?
                            </FormLabel>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                              >
                                limpiar
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {CITY_VIEWS.map((key) => (
                              <Chip
                                key={key}
                                active={field.value === key}
                                onClick={() => field.onChange(key)}
                              >
                                {CITY_VIEW_LABELS[key]}
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
                            <FormLabel className="text-gray-800">
                              ¿Cuál es tu estilo de viaje?{" "}
                              <span className="text-sm text-gray-500">
                                (selecciona todas las que apliquen)
                              </span>
                            </FormLabel>
                            {Array.isArray(field.value) &&
                              field.value.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange([])}
                                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                                >
                                  limpiar
                                </button>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {TRAVEL_STYLES.map((key) => {
                              const active = (field.value ?? []).includes(key);
                              return (
                                <Chip
                                  key={key}
                                  active={active}
                                  onClick={() => {
                                    const set = new Set(field.value ?? []);
                                    if (active) {
                                      set.delete(key);
                                    } else {
                                      set.add(key);
                                    }
                                    field.onChange(Array.from(set));
                                  }}
                                >
                                  {TRAVEL_STYLE_LABELS[key]}
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
                            <FormLabel className="text-gray-800">
                              ¿Cuáles son tus preferencias alimentarias?{" "}
                              <span className="text-sm text-gray-500">
                                (selecciona todas las que apliquen)
                              </span>
                            </FormLabel>
                            {Array.isArray(field.value) &&
                              field.value.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange([])}
                                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                                >
                                  limpiar
                                </button>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {FOOD_PREFS.map((key) => {
                              const active = (field.value ?? []).includes(key);
                              return (
                                <Chip
                                  key={key}
                                  active={active}
                                  onClick={() => {
                                    const set = new Set(field.value ?? []);
                                    if (active) {
                                      set.delete(key);
                                    } else {
                                      set.add(key);
                                    }
                                    field.onChange(Array.from(set));
                                  }}
                                >
                                  {FOOD_PREF_LABELS[key]}
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
                              <FormLabel className="text-gray-800">
                                Presupuesto (USD)
                              </FormLabel>
                              {field.value !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(undefined)}
                                  className="text-sm text-gray-500 hover:underline"
                                >
                                  limpiar
                                </button>
                              )}
                            </div>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ej: 300"
                                className="h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-sky-500 focus:border-sky-500 placeholder:text-gray-400"
                                disabled={loading}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Por persona y para todo el viaje
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Hidden/default currency field to keep contract clear */}
                      <FormField
                        control={form.control}
                        name="preferences.budget_currency"
                        render={({ field }) => (
                          <input
                            type="hidden"
                            value={field.value ?? "USD"}
                            readOnly
                          />
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
                            <FormLabel className="text-gray-800">
                              ¿Algo más que quieras agregar?
                            </FormLabel>
                            {(field.value ?? "").length > 0 && (
                              <button
                                type="button"
                                onClick={() => field.onChange("")}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                limpiar
                              </button>
                            )}
                          </div>
                          <FormControl>
                            <Textarea
                              maxLength={250}
                              placeholder="Ej: Quiero más deportes acuáticos, o me gustaría usar un auto para moverme"
                              className="rounded-2xl border-gray-200 shadow-md focus:ring-sky-500 focus:border-sky-500 min-h-28 placeholder:text-gray-400"
                              disabled={loading}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Mensaje de error del servidor */}
                {error && (
                  <Alert variant="destructive">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full bg-sky-500 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 text-white text-base font-semibold shadow-md transition"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creando tu itinerario...
                    </span>
                  ) : (
                    "Generar itinerario"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
