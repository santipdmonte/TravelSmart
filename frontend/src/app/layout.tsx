import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import { ChatProvider } from "@/contexts/AgentContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { __warnMissingApiBaseIfNeeded } from "@/lib/config";
import ClientTravelerTestWelcome from "@/components/traveler-test/ClientTravelerTestWelcome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelSmart - Itinerarios de viaje impulsados por IA",
  description: "Crea itinerarios de viaje personalizados con ayuda de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log in server console when the app renders and the env var is missing
  __warnMissingApiBaseIfNeeded({ when: "onLoad" });
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ItineraryProvider>
            <ChatProvider>
              <SidebarProvider className="bg-gray-50">
                <AppSidebar />
                <SidebarInset>
                  <div className="flex h-12 items-center gap-2 px-2 bg-gray-50">
                    <SidebarTrigger />
                    <span className="text-sm text-muted-foreground">Menú</span>
                  </div>
                  {children}
                  {/* Client-only welcome traveler test prompt */}
                  <ClientTravelerTestWelcome />
                </SidebarInset>
              </SidebarProvider>
            </ChatProvider>
          </ItineraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
