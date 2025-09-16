"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/LoadingSpinner"
import { getTravelerTypeDetails } from "@/lib/travelerTestApi"
import type { TravelerType } from "@/types/travelerTest"

export default function TravelerTypePage() {
  const { user } = useAuth()
  const [resolvedTravelerType, setResolvedTravelerType] = useState<TravelerType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    <div className="container mx-auto max-w-3xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tu tipo de viajero</CardTitle>
          <CardDescription>
            {resolvedTravelerType ? "Basado en tu último test de viajero" : "Aún no has realizado el test de viajero"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resolvedTravelerType ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">{resolvedTravelerType.name}</h2>
              {resolvedTravelerType.description && (
                <p className="text-muted-foreground whitespace-pre-line">{resolvedTravelerType.description}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Realiza el test para conocer tu tipo de viajero.</p>
          )}

          <div className="pt-2">
            <Button asChild>
              <Link href="/traveler-test">Volver a realizar test de viajero</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


