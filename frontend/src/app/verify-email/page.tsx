"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, isAuthenticated, user } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setVerificationStatus("error");
      setErrorMessage(
        "Invalid verification link. Please check your email and try again."
      );
      return;
    }

    // Prevent multiple verification attempts
    if (verificationStatus !== "loading") {
      console.log("Skipping verification - status is:", verificationStatus);
      return;
    }

    const verifyEmailToken = async () => {
      try {
        console.log("Attempting to verify email with token:", token);
        const success = await verifyEmail(token);

        if (success) {
          setVerificationStatus("success");
          // Redirect to home page after 10 seconds 
          setTimeout(() => {
            setIsRedirecting(true);
            router.push("/");
          }, 10000);
        } else {
          setVerificationStatus("error");
          setErrorMessage(
            "Email verification failed. The link may be expired or invalid."
          );
        }
      } catch {
        setVerificationStatus("error");
        setErrorMessage(
          "An error occurred during verification. Please try again."
        );
      }
    };

    verifyEmailToken();
  }, [searchParams, verifyEmail, router, verificationStatus]);

  // If user is already authenticated and verification is complete, redirect to home
  useEffect(() => {
    if (isAuthenticated && user && verificationStatus !== "success") {
      setVerificationStatus("success");
    }
  }, [isAuthenticated, user, router, verificationStatus]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Verifying your email
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Email verified successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              Welcome to TravelSmart! You&apos;re now logged in and ready to
              start planning your adventures.
            </p>
            {isRedirecting && (
              <p className="text-sm text-blue-600">
                Redirecting you to the dashboard...
              </p>
            )}
            <Button
              onClick={() => router.push("/")}
              className="mt-4"
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Go to Dashboard"
              )}
            </Button>
          </div>
        );

      case "error":
        if (isAuthenticated) {
          // If user is authenticated, treat as success
          return (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Email already verified!
              </h2>
              <p className="text-sm text-muted-foreground">
                You&apos;re already logged in and ready to start planning your adventures.
              </p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          );
        }
        // Show error UI for unauthenticated users
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Verification failed
            </h2>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please try one of the following:
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register">Register Again</Link>
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                TravelSmart
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Email Verification</CardTitle>
              <CardDescription>Complete your account setup</CardDescription>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 TravelSmart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
