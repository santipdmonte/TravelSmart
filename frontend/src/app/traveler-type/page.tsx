"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/LoadingSpinner"
import { getTravelerTypeDetails } from "@/lib/travelerTestApi"
import type { TravelerType } from "@/types/travelerTest"

export default function TravelerTypePage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuth()
  const [resolvedTravelerType, setResolvedTravelerType] = useState<TravelerType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isInitialized, isAuthenticated, router])

  useEffect(() => {
    let isMounted = true
    const resolveType = async () => {
      if (!user) {
        if (isMounted) setIsLoading(false)
        return
      }

      if (user.traveler_type) {
        if (isMounted) {
          setResolvedTravelerType(user.traveler_type)
          setIsLoading(false)
        }
        return
      }

      if (user.traveler_type_id) {
        try {
          const resp = await getTravelerTypeDetails(user.traveler_type_id)
          if (isMounted && resp.data) setResolvedTravelerType(resp.data)
        } finally {
          if (isMounted) setIsLoading(false)
        }
        return
      }

      if (isMounted) setIsLoading(false)
    }

    resolveType()
    return () => {
      isMounted = false
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-palette-light-sky">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 pl-3">Tu tipo de viajero</h1>
          </div>
          
          <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Perfil de viajero</CardTitle>
              <CardDescription className="text-gray-600">
                {resolvedTravelerType ? "Basado en tu último test de viajero" : "Aún no has realizado el test de viajero"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resolvedTravelerType ? (
                <div className="space-y-4">
                  <div className="p-6 bg-sky-50 rounded-2xl border border-sky-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{resolvedTravelerType.name}</h2>
                    {resolvedTravelerType.description && (
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{resolvedTravelerType.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-sky-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-sky-600 text-2xl">🧳</span>
                  </div>
                  <p className="text-gray-600 mb-6">Realiza el test para conocer tu tipo de viajero y obtener recomendaciones personalizadas.</p>
                </div>
              )}

              <div className="pt-4">
                <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-700 shadow-lg hover:shadow-xl transform hover:scale-105 px-8 py-3">
                  <Link href="/traveler-test">
                    {resolvedTravelerType ? "Volver a realizar test de viajero" : "Realizar test de viajero"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


