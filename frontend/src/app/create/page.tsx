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
  Input,
  Textarea,
  Alert,
  AlertDescription,
  Slider,
} from "@/components";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Opciones
const WHEN_OPTIONS = [
  { key: "winter", label: "Invierno" },
  { key: "spring", label: "Primavera" },
  { key: "summer", label: "Verano" },
  { key: "fall", label: "Otoño" },
] as const;

type CityView = "touristy" | "off_beaten" | "local";

const BUDGET_OPTIONS = [
  {
    key: "economico",
    label: "Economico",
    description:
      "Viaja ligero, vive la aventura y descubre cada rincón gastando lo mínimo. Ideal para quienes buscan experiencias auténticas sin preocuparse por el lujo",
  },
  {
    key: "intermedio",
    label: "Intermedio",
    description:
      "Equilibrio perfecto entre cuidar el bolsillo y disfrutar con comodidad. Una forma flexible y eficiente de viajar sin complicaciones.",
  },
  {
    key: "confort",
    label: "Confort",
    description:
      "Viaja sin preocupaciones y con todo a tu alcance. Perfecto si valoras la comodidad y quieres experiencias bien organizadas y agradables",
  },
  {
    key: "lujo",
    label: "Lujo",
    description:
      "Exclusividad, atención al detalle y experiencias inolvidables. La manera más sofisticada de viajar y disfrutar cada destino al máximo.",
  },
] as const;

const TRAVEL_PACE_OPTIONS = [
  {
    key: "relax",
    label: "Relax",
    description:
      "Viaja sin prisa, disfruta cada momento y relájate. Ideal si buscas descanso y tiempo para saborear cada destino.",
  },
  {
    key: "equilibrado",
    label: "Equilibrado",
    description:
      "Un ritmo armonioso entre explorar y descansar. Perfecto para quienes quieren ver cosas sin agotarse.",
  },
  {
    key: "activo",
    label: "Activo",
    description:
      "Mantente en movimiento y descubre mucho en cada día. Ideal si te gusta aprovechar el tiempo y experimentar varias actividades.",
  },
] as const;

const CITY_VIEW_OPTIONS = [
  {
    key: "touristy" as CityView,
    label: "Turístico",
    description:
      "Visita los lugares más famosos y emblemáticos. Perfecto para conocer lo esencial y disfrutar de las atracciones principales.",
  },
  {
    key: "off_beaten" as CityView,
    label: "Fuera de lo común",
    description:
      "Descubre joyas escondidas y lugares poco conocidos. Ideal para quienes buscan experiencias únicas y diferentes.",
  },
  {
    key: "local" as CityView,
    label: "Como un local",
    description:
      "Vive el destino como lo hacen los habitantes locales. Perfecto para una experiencia auténtica y cultural.",
  },
];

const TRIP_TYPE_OPTIONS = [
  {
    key: "solo" as const,
    label: "Viajo solo",
    description:
      "Aventura en solitario con total libertad para explorar a tu ritmo y conocer nuevas personas.",
  },
  {
    key: "friends" as const,
    label: "Amigos",
    description:
      "Diversión y aventuras compartidas con tu grupo de amigos. Momentos inolvidables juntos.",
  },
  {
    key: "couples" as const,
    label: "Pareja",
    description:
      "Experiencias románticas y momentos especiales para compartir en pareja.",
  },
  {
    key: "family_teen" as const,
    label: "Familia (adolescentes/adultos)",
    description:
      "Actividades variadas y emocionantes para familias con hijos mayores. Algo para todos.",
  },
  {
    key: "family_young_kids" as const,
    label: "Familia (niños pequeños)",
    description:
      "Planes adaptados para los más pequeños con comodidad y seguridad. Diversión familiar garantizada.",
  },
];

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
    .string({ required_error: "La duración es obligatoria" })
    .min(1, "La duración es obligatoria")
    .regex(/^(?:[1-9]|[12][0-9]|30)$/u, "Ingresa un número válido (1-30)"),
  preferences: z
    .object({
      when: z.enum(["winter", "spring", "summer", "fall"]).optional(),
      goal: z
        .string()
        .min(2, "El objetivo es obligatorio")
        .max(150, "Máximo 150 caracteres"),
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
      budget: z.enum(["economico", "intermedio", "confort", "lujo"]).optional(),
      travel_pace: z.enum(["relax", "equilibrado", "activo"]).optional(),
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
      preferences: {
        when: undefined,
        goal: "",
        trip_type: undefined,
        occasion: undefined,
        city_view: undefined,
        travel_styles: [],
        food_preferences: [],
        budget: "intermedio",
        travel_pace: "equilibrado",
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
    const scrollBarComp =
      window.innerWidth - document.documentElement.clientWidth;
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
          acc[k] = v as unknown;
          return acc;
        },
        {}
      );

      const request: GenerateItineraryRequest = {
        trip_name: data.trip_name,
        duration_days: Number(data.duration_days),
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

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Avoid event bubbling causing submit when UI switches to submit button
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLButtonElement).blur();

    if (step === 1) {
      const valid = await form.trigger(["trip_name", "duration_days"], {
        shouldFocus: true,
      });
      if (!valid) return;
    } else if (step === 2) {
      const valid = await form.trigger(["preferences.goal"], {
        shouldFocus: true,
      });
      if (!valid) return;
    }
    // Defer step change to next tick to avoid pointerup landing on new submit button
    setTimeout(() => {
      setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : 4));
    }, 0);
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
          acc[k] = v as unknown;
          return acc;
        },
        {}
      );
      const request: GenerateItineraryRequest = {
        trip_name: data.trip_name,
        duration_days: Number(data.duration_days),
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
    <div className="bg-gray-50">
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            pointerEvents: "all",
          }}
          onClick={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          <div
            style={{
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
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
            <div className="pl-3 pb-4 text-sm text-gray-500">
              Paso {step} de 4
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Card 1: Destino y Duración */}
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="trip_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="pl-3 pb-1 text-gray-800">
                            Destinos
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="¿Donde quieres viajar?"
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
                          <FormLabel className="pl-3 pb-1 text-gray-800">
                            Duración
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={2}
                              placeholder="¿Cuántos días?"
                              className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-rose-500 focus:border-rose-500 placeholder:text-gray-400"
                              disabled={loading}
                              value={(field.value as unknown as string) ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (form.formState.errors.duration_days) {
                                  form.clearErrors("duration_days");
                                }
                                if (
                                  value === "" ||
                                  /^[0-9]{0,2}$/.test(value)
                                ) {
                                  field.onChange(value);
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
                          <FormLabel className="pl-3 pb-1 text-gray-800">
                            Objetivo del viaje*
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="¿Que objetivo tienes para el viaje?"
                              className="pl-6 h-14 text-base rounded-full border-gray-200 shadow-md focus:ring-sky-500 focus:border-sky-500 placeholder:text-gray-400"
                              disabled={loading}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
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
                            <FormLabel className="pl-3 pb-1 text-gray-800">
                              Temporada del viaje
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

                    <FormField
                      control={form.control}
                      name="preferences.budget"
                      render={({ field }) => {
                        const budgetIndex = field.value
                          ? BUDGET_OPTIONS.findIndex(
                              (opt) => opt.key === field.value
                            )
                          : -1;

                        const handleSliderChange = (value: number[]) => {
                          field.onChange(BUDGET_OPTIONS[value[0]].key);
                        };

                        return (
                          <FormItem>
                            <div className="flex items-center gap-3 mb-2">
                              <FormLabel className="pl-3 pb-1 text-gray-800">
                                Presupuesto*
                              </FormLabel>
                            </div>
                            <div className="px-4 py-6">
                              {/* Selected Value Display */}
                              {budgetIndex >= 0 && (
                                <div className="text-center mb-6">
                                  <span className="inline-block px-6 py-2 bg-sky-500 text-white rounded-full text-base font-medium shadow-md">
                                    {BUDGET_OPTIONS[budgetIndex].label}
                                  </span>
                                </div>
                              )}

                              {/* Slider */}
                              <div className="relative">
                                {/* Centered slider at 80% width */}
                                <div className="flex justify-center mb-4">
                                  <div className="w-4/5">
                                    <FormControl>
                                      <Slider
                                        min={0}
                                        max={3}
                                        step={1}
                                        value={
                                          budgetIndex >= 0 ? [budgetIndex] : [1]
                                        }
                                        onValueChange={handleSliderChange}
                                        disabled={loading}
                                        className="w-full"
                                      />
                                    </FormControl>
                                  </div>
                                </div>

                                {/* Labels below slider - full width */}
                                <TooltipProvider>
                                  <div className="flex justify-between px-1">
                                    {BUDGET_OPTIONS.map((opt, idx) => (
                                      <Tooltip
                                        key={opt.key}
                                        delayDuration={200}
                                      >
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              field.onChange(opt.key)
                                            }
                                            className={`text-xs font-medium transition-colors ${
                                              budgetIndex === idx
                                                ? "text-sky-600 font-semibold"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                            style={{
                                              width: "25%",
                                              textAlign: "center",
                                            }}
                                          >
                                            {opt.label}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          className="max-w-xs bg-gray-900 text-white p-3"
                                          sideOffset={5}
                                        >
                                          <p className="text-xs leading-relaxed">
                                            {opt.description}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </div>
                                </TooltipProvider>
                              </div>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                )}

                {/* Card 3: Estilo de visita y Ritmo de viaje */}
                {step === 3 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="preferences.city_view"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="pl-3 pb-1 text-gray-800">
                              ¿Como te gustaría ver el destino?
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
                          <TooltipProvider>
                            <div className="flex flex-wrap gap-3">
                              {CITY_VIEW_OPTIONS.map((opt) => (
                                <Tooltip key={opt.key} delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Chip
                                        active={field.value === opt.key}
                                        onClick={() => field.onChange(opt.key)}
                                      >
                                        {opt.label}
                                      </Chip>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="max-w-xs bg-gray-900 text-white p-3"
                                    sideOffset={5}
                                  >
                                    <p className="text-xs leading-relaxed">
                                      {opt.description}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.travel_pace"
                      render={({ field }) => {
                        const paceIndex = field.value
                          ? TRAVEL_PACE_OPTIONS.findIndex(
                              (opt) => opt.key === field.value
                            )
                          : -1;

                        const handleSliderChange = (value: number[]) => {
                          field.onChange(TRAVEL_PACE_OPTIONS[value[0]].key);
                        };

                        return (
                          <FormItem>
                            <div className="flex items-center gap-3 mb-2">
                              <FormLabel className="pl-3 pb-1 text-gray-800">
                                Ritmo de viaje*
                              </FormLabel>
                            </div>
                            <div className="px-4 py-6">
                              {/* Selected Value Display */}
                              {paceIndex >= 0 && (
                                <div className="text-center mb-6">
                                  <span className="inline-block px-6 py-2 bg-sky-500 text-white rounded-full text-base font-medium shadow-md">
                                    {TRAVEL_PACE_OPTIONS[paceIndex].label}
                                  </span>
                                </div>
                              )}

                              {/* Slider */}
                              <div className="relative">
                                {/* Centered slider at 80% width */}
                                <div className="flex justify-center mb-4">
                                  <div className="w-4/5">
                                    <FormControl>
                                      <Slider
                                        min={0}
                                        max={2}
                                        step={1}
                                        value={
                                          paceIndex >= 0 ? [paceIndex] : [1]
                                        }
                                        onValueChange={handleSliderChange}
                                        disabled={loading}
                                        className="w-full"
                                      />
                                    </FormControl>
                                  </div>
                                </div>

                                {/* Labels below slider - full width */}
                                <TooltipProvider>
                                  <div className="flex justify-between px-1">
                                    {TRAVEL_PACE_OPTIONS.map((opt, idx) => (
                                      <Tooltip
                                        key={opt.key}
                                        delayDuration={200}
                                      >
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              field.onChange(opt.key)
                                            }
                                            className={`text-xs font-medium transition-colors ${
                                              paceIndex === idx
                                                ? "text-sky-600 font-semibold"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                            style={{
                                              width: "33.33%",
                                              textAlign: "center",
                                            }}
                                          >
                                            {opt.label}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          className="max-w-xs bg-gray-900 text-white p-3"
                                          sideOffset={5}
                                        >
                                          <p className="text-xs leading-relaxed">
                                            {opt.description}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </div>
                                </TooltipProvider>
                              </div>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                )}

                {/* Card 4: Compañía y Notas */}
                {step === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="preferences.trip_type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="pl-3 pb-1 text-gray-800">
                              ¿Con quienes vas a compartir el viaje?
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
                          <TooltipProvider>
                            <div className="flex flex-wrap gap-3">
                              {TRIP_TYPE_OPTIONS.map((opt) => (
                                <Tooltip key={opt.key} delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Chip
                                        active={field.value === opt.key}
                                        onClick={() => field.onChange(opt.key)}
                                      >
                                        {opt.label}
                                      </Chip>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="max-w-xs bg-gray-900 text-white p-3"
                                    sideOffset={5}
                                  >
                                    <p className="text-xs leading-relaxed">
                                      {opt.description}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.notes"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormLabel className="pl-3 pb-1 text-gray-800">
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
                              placeholder="¿Alguna actividad especifica? ¿Alguna atraccion que gustaria ver?"
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

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-2">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={loading || step === 1}
                      className="rounded-full h-auto px-6 py-2.5"
                    >
                      Atrás
                    </Button>
                  ) : (
                    <div className="w-10" />
                  )}
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="rounded-full h-auto px-6 py-2.5 border border-sky-500 bg-sky-500 text-white shadow-sm hover:bg-sky-600"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-full h-auto px-6 py-2.5 border border-sky-500 bg-sky-500 text-white shadow-sm hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="ai-sparkle"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2l1.9 4.6L18.5 8 13.9 9.4 12 14l-1.9-4.6L6 8l4.6-1.4L12 2z"
                              fill="currentColor"
                              opacity=".95"
                            />
                            <path
                              d="M6 16l.9 2.2L9 19l-2.1.6L6 22l-.9-2.4L3 19l2.1-.8L6 16z"
                              fill="currentColor"
                              opacity=".9"
                            />
                            <path
                              d="M18 14l1.2 2.8L22 18l-2.8.8L18 22l-1.2-3.2L14 18l2.8-1.2L18 14z"
                              fill="currentColor"
                              opacity=".9"
                            />
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
