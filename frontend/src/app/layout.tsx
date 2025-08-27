import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import { ChatProvider } from "@/contexts/AgentContext";
import { Navigation } from "@/components";
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
  title: "TravelSmart - AI-Powered Travel Itineraries",
  description: "Create personalized travel itineraries with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log in server console when the app renders and the env var is missing
  __warnMissingApiBaseIfNeeded({ when: "onLoad" });
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ItineraryProvider>
            <ChatProvider>
              <Navigation />
              <main>
                {children}
                {/* Client-only welcome traveler test prompt */}
                <ClientTravelerTestWelcome />
              </main>
            </ChatProvider>
          </ItineraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
