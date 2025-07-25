import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import { ChatProvider } from "@/contexts/AgentContext";
import { Navigation } from "@/components";

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
              </main>
            </ChatProvider>
          </ItineraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
