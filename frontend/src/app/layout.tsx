import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import { ChatProvider } from "@/contexts/AgentContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { __warnMissingApiBaseIfNeeded } from "@/lib/config";
import ClientTravelerTestWelcome from "@/components/traveler-test/ClientTravelerTestWelcome";
import { Toast } from "@/components/Toast";

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
    <html lang="es" suppressHydrationWarning className="bg-palette-light-sky">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ItineraryProvider>
            <ChatProvider>
              <ToastProvider>
                <SidebarProvider className="bg-palette-light-sky">
                  <AppSidebar />
                  <SidebarInset className="min-h-screen bg-palette-light-sky">
                    <div className="flex h-12 items-center gap-2 px-2 bg-palette-light-sky">
                      <SidebarTrigger />
                      <span className="text-sm text-muted-foreground text-palette-dark-sky font-bold">Menú</span>
                    </div>
                    {children}
                    {/* Client-only welcome traveler test prompt */}
                    <ClientTravelerTestWelcome />
                  </SidebarInset>
                </SidebarProvider>
                {/* Global Toast Notifications */}
                <Toast />
              </ToastProvider>
            </ChatProvider>
          </ItineraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
