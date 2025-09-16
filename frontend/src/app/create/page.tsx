"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
// import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useAuth } from "@/hooks/useAuth";
import { GenerateItineraryRequest } from "@/types/itinerary";
import { TravelerTestPromptModal } from "@/components";
import Loader from "@/components/loader/Loader";
import TextType from "@/components/TextType";
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
      goal: z
        .string()
        .max(150, "Máximo 150 caracteres")
        .optional(),
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
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  // Ensure we only apply backend defaults once
  const appliedDefaultsRef = useRef(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createItinerarySchema),
    defaultValues: {
      trip_name: "",
      duration_days: 7,
      preferences: {
        when: undefined,
        goal: "",
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

  // Apply default travel styles from user profile on first load only (disabled en nuevo flujo)
  useEffect(() => {
    if (appliedDefaultsRef.current) return;
    appliedDefaultsRef.current = true;
  }, []);

  const [showPreCreatePrompt, setShowPreCreatePrompt] = useState(false);
  const pendingSubmissionRef = useRef<FormData | null>(null);

  // Lock scroll while loading (overlay visible)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loading) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarComp = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarComp > 0) {
      document.body.style.paddingRight = `${scrollBarComp}px`;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [loading]);

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

  const handleNext = async () => {
    if (step === 1) {
      const valid = await form.trigger(["trip_name", "duration_days"], {
        shouldFocus: true,
      });
      if (!valid) return;
    }
    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : 4));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1));
  };

  const proceedAfterPrompt = async () => {
    setShowPreCreatePrompt(false);
    const data = pendingSubmissionRef.current;
    if (!data) return;
    pendingSubmissionRef.current = null;
    try {
      if (error) clearError();
      const prefs = data.preferences || {};
      const cleanedEntries = Object.entries(prefs).filter(([, v]) => {
        if (v === undefined || v === null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim().length > 0;
        return true;
      });
      const cleanedPreferences = cleanedEntries.reduce<Record<string, unknown>>(
        (acc, [k, v]) => {
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
    } catch (e) {
      console.error("Error creating itinerary after prompt:", e);
    }
  };

  // Show pre-create traveler test prompt immediately on page load
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!user) return;
    if (user.traveler_type_id) return;
    // Only show once per page mount
    setShowPreCreatePrompt(true);
  }, [isAuthenticated, user]);

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
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Loader size={180} />
            <TextType
              text={[
                "Generando itinerario...",
                "Planificando Rutas...",
                "Optimizando Rutas...",
                "Planificando actividades...",
                "Optimizando actividades...",
                "Generando enlaces de alojamiento...",
              ]}
              typingSpeed={100}
              pauseDuration={4000}
              showCursor={false}
              textColors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]}
              className="text-xl font-bold mt-4"
            />
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 pl-3">
              Crea tu itinerario
            </h1>
            <p className="text-gray-600 mb-6 pl-3">
              Cuéntanos sobre tu viaje y crearemos un itinerario personalizado
              para ti.
            </p>

            {/* Step indicator */}
            <div className="pl-3 pb-4 text-sm text-gray-500">Paso {step} de 4</div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Card 1: Destino y Duración */}
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="trip_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="pl-3 pb-1 text-gray-800">Destino</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="¿Donde quieres ir?"
                              className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-rose-500 focus:border-rose-500 placeholder:text-gray-400"
                              disabled={loading}
                              {...field}
                              onChange={(e) => {
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

                    <FormField
                      control={form.control}
                      name="duration_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="pl-3 pb-1 text-gray-800">Duración</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="30"
                              placeholder="¿Cuántos días?"
                              className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-rose-500 focus:border-rose-500 placeholder:text-gray-400"
                              disabled={loading}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (form.formState.errors.duration_days) {
                                  form.clearErrors("duration_days");
                                }
                                if (value === "") {
                                  field.onChange("");
                                } else {
                                  const numValue = parseInt(value, 10);
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue);
                                  } else {
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
                  </div>
                )}

                {/* Card 2: Objetivo, Temporada, Presupuesto */}
                {step === 2 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="preferences.goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="pl-3 pb-1 text-gray-800">Objetivo del viaje</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Descansar, conocer la cultura, aventura..."
                              className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-sky-500 focus:border-sky-500 placeholder:text-gray-400"
                              disabled={loading}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>Opcional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.when"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">Temporada del viaje</FormLabel>
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
                              <Chip key={opt.key} active={field.value === opt.key} onClick={() => field.onChange(opt.key)}>
                                {opt.label}
                              </Chip>
                            ))}
                          </div>
                          <FormDescription>Opcional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferences.budget"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormLabel className="text-gray-800">Presupuesto (USD)</FormLabel>
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
                                    e.target.value === "" ? undefined : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>Por persona y para todo el viaje (opcional)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.budget_currency"
                        render={({ field }) => (
                          <input type="hidden" value={field.value ?? "USD"} readOnly />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Card 3: Compañía y Estilo de visita */}
                {step === 3 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="preferences.trip_type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">Viaje con</FormLabel>
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
                            <Chip active={field.value === "friends"} onClick={() => field.onChange("friends")}>Amigos</Chip>
                            <Chip active={field.value === "family_teen"} onClick={() => field.onChange("family_teen")}>Familia</Chip>
                            <Chip active={field.value === "couples"} onClick={() => field.onChange("couples")}>Pareja</Chip>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.city_view"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">Ver el destino como...</FormLabel>
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
                            {(["touristy", "local", "off_beaten"] as const).map((key) => (
                              <Chip key={key} active={field.value === key} onClick={() => field.onChange(key)}>
                                {CITY_VIEW_LABELS[key]}
                              </Chip>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Card 4: Notas */}
                {step === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="preferences.notes"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="text-gray-800">¿Algo más para tener en cuenta?</FormLabel>
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

                {/* Server error */}
                {error && (
                  <Alert variant="destructive">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="secondary" onClick={handleBack} disabled={loading || step === 1}>
                    Atrás
                  </Button>
                  {step < 4 ? (
                    <Button type="button" onClick={handleNext} disabled={loading} className="ai-button">
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="ai-button disabled:opacity-60 disabled:cursor-not-allowed"
                      size="lg"
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        const mx = ((e.clientX - rect.left) / rect.width) * 100;
                        const my = ((e.clientY - rect.top) / rect.height) * 100;
                        (e.currentTarget as HTMLButtonElement).style.setProperty("--mx", `${mx}%`);
                        (e.currentTarget as HTMLButtonElement).style.setProperty("--my", `${my}%`);
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creando tu itinerario...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="ai-sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l1.9 4.6L18.5 8 13.9 9.4 12 14l-1.9-4.6L6 8l4.6-1.4L12 2z" fill="currentColor" opacity=".95"/>
                            <path d="M6 16l.9 2.2L9 19l-2.1.6L6 22l-.9-2.4L3 19l2.1-.8L6 16z" fill="currentColor" opacity=".9"/>
                            <path d="M18 14l1.2 2.8L22 18l-2.8.8L18 22l-1.2-3.2L14 18l2.8-1.2L18 14z" fill="currentColor" opacity=".9"/>
                          </svg>
                          Generar itinerario
                        </span>
                      )}
                    </Button>
                  )}
                </div>

                <TravelerTestPromptModal
                  open={showPreCreatePrompt}
                  onClose={() => {
                    proceedAfterPrompt();
                  }}
                  title="¡Para un itinerario perfecto, haz el test!"
                  message="Completar el Traveler Test mejora la personalización. Si prefieres, puedes seguir sin hacerlo por ahora."
                  ctaText="Hacer el test"
                  onAction={() => {
                    setShowPreCreatePrompt(false);
                    pendingSubmissionRef.current = null;
                    window.location.href = "/traveler-test";
                  }}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
