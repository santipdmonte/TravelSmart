"use client";

import { useEffect, useState } from "react";
import { getTestResult, getTravelerTypeDetails } from "@/lib/travelerTestApi";
import {
  TestResult as TestResultType,
  TestResultResponse,
} from "@/types/travelerTest";
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Importar el componente Image
import { useAuth } from "@/hooks/useAuth";

interface TestResultProps {
  testId: string;
}

export default function TestResult({ testId }: TestResultProps) {
  // ... (el resto del código del componente sigue igual) ...
  const [result, setResult] = useState<TestResultType | null>(null);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [typeNameMap, setTypeNameMap] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const fetchResult = async () => {
      // Prefer the freshly returned submission payload if available
      try {
        const cached = sessionStorage.getItem(`traveler_test_result_${testId}`);
        if (cached) {
          const parsed: TestResultResponse = JSON.parse(cached);
          if (parsed && parsed.user_traveler_test) {
            setResult({
              ...parsed.user_traveler_test,
              traveler_type: parsed.traveler_type || undefined,
            } as unknown as TestResultType);
            if (parsed.scores) setScores(parsed.scores);
            setStatus("success");
            return;
          }
        }
      } catch {}

      const response = await getTestResult(testId);
      if (response.error || !response.data) {
        setError(
          response.error || "No se pudieron obtener los resultados del test."
        );
        setStatus("error");
      } else {
        setResult(response.data);
        setStatus("success");
        try {
          await refreshProfile();
        } catch {}
      }
    };
    fetchResult();
  }, [testId, refreshProfile]);

  // When scores arrive keyed by traveler type IDs, fetch names to display instead of IDs
  useEffect(() => {
    if (!scores) return;
    const keys = Object.keys(scores);
    if (keys.length === 0) return;

    // Detect UUID v4 or Mongo-like ObjectId to avoid mistaking human-readable names with hyphens
    const looksLikeId = (s: string) =>
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        s
      ) || /^[0-9a-fA-F]{24}$/.test(s);
    const idsToFetch = keys.filter(
      (k) => looksLikeId(k) && !(k in typeNameMap)
    );
    if (idsToFetch.length === 0) return;

    (async () => {
      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const res = await getTravelerTypeDetails(id);
            if (res.data?.name) return [id, res.data.name] as const;
          } catch {}
          return null;
        })
      );
      const mapUpdates: Record<string, string> = {};
      for (const entry of results) {
        if (entry) mapUpdates[entry[0]] = entry[1];
      }
      if (Object.keys(mapUpdates).length) {
        setTypeNameMap((prev) => ({ ...prev, ...mapUpdates }));
      }
    })();
  }, [scores, typeNameMap]);

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4">Calculando tus resultados...</p>
      </div>
    );
  }

  if (status === "error" || !result || !result.traveler_type) {
    return (
      <ErrorMessage
        message={error || "Ocurrió un error al obtener tus resultados."}
      />
    );
  }

  const { traveler_type } = result;

  return (
    <div className="bg-palette-light-sky min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Test completado!
            </h1>
            <p className="text-gray-600">
              Descubre tu personalidad viajera
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left side - Main result */}
            <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-sky-600" />
                </div>
                <p className="text-sm font-semibold text-sky-600 mb-2">
                  TU TIPO DE VIAJERO ES
                </p>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {traveler_type.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {traveler_type.image_url && (
                  <div className="relative h-40 w-full my-4">
                    <Image
                      src={traveler_type.image_url}
                      alt={traveler_type.name}
                      fill
                      className="rounded-2xl object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <CardDescription className="text-base text-gray-700 leading-relaxed">
                    {traveler_type.description}
                  </CardDescription>
                </div>

                <div className="mt-6">
                  <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-700 shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2.5">
                    <Link href="/create">Crea un itinerario personalizado</Link>
                  </Button>
                  <p className="mt-3 text-xs text-gray-500">
                    ¡Usaremos este resultado para personalizar tus sugerencias!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Detailed scores */}
            {scores && (
              <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 text-center">
                    Tu personalidad viajera al detalle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {Object.entries(scores).map(([key, score]) => {
                      const pctRaw = typeof score === "number" ? score : 0;
                      const pct = Math.max(
                        0,
                        Math.min(100, Math.round(pctRaw <= 1 ? pctRaw * 100 : pctRaw))
                      );
                      const displayName = typeNameMap[key] || key;
                      return (
                        <li key={key} className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">
                              {displayName}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {pct}%
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Score de ${displayName}`}
                            className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden"
                          >
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
