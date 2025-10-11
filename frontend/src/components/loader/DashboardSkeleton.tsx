"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>

          {/* Bento grid - Row 1 (map spans two rows to match left stack) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-6 mb-6 items-stretch">
            {/* User summary card (row 1) */}
            <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full lg:col-span-1 lg:row-span-1">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Tu perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traveler type card (row 2) */}
            <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full lg:col-span-1 lg:row-span-1 lg:row-start-2">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Tipo de viajero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="pt-2">
                    <Skeleton className="h-9 w-32 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map mockup card */}
            <div className="lg:col-span-2 lg:row-span-2">
              <Card className="bg-white rounded-3xl shadow-xl border-none overflow-hidden h-full p-0">
                <CardContent className="h-full p-0 relative">
                  {/* Map skeleton */}
                  <div className="h-full min-h-64 md:min-h-[26rem] bg-gray-100">
                    <Skeleton className="h-full w-full" />
                  </div>
                  {/* Overlay buttons skeleton */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bento grid - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent itineraries list (span 2 cols) */}
            <div className="lg:col-span-2">
              <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">Tus itinerarios recientes</CardTitle>
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick actions (right side) */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Acciones rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-full" />
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
