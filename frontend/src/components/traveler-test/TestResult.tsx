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
    <Card className="max-w-2xl mx-auto my-8 shadow-2xl overflow-hidden">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-amber-600">
          TU TIPO DE VIAJERO ES
        </p>
        <CardTitle className="text-4xl font-bold">
          {traveler_type.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {traveler_type.image_url && (
          <div className="relative h-56 w-full my-4">
            <Image
              src={traveler_type.image_url}
              alt={traveler_type.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
        <CardDescription className="text-lg text-gray-700 my-4">
          {traveler_type.description}
        </CardDescription>

        {scores && (
          <div className="mt-8 text-left max-w-md mx-auto w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Tu personalidad viajera al detalle
            </h3>
            <ul className="space-y-4">
              {Object.entries(scores).map(([key, score]) => {
                const pctRaw = typeof score === "number" ? score : 0;
                const pct = Math.max(
                  0,
                  Math.min(100, Math.round(pctRaw <= 1 ? pctRaw * 100 : pctRaw))
                );
                const displayName = typeNameMap[key] || key;
                return (
                  <li key={key} className="w-full">
                    <div className="flex items-center justify-between mb-1">
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
                      className="h-3 w-full bg-gray-200 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/create">Crea un itinerario personalizado</Link>
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            ¡Ahora usaremos este resultado para personalizar tus sugerencias de
            viaje!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
