"use client";

import { useState } from "react";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailVerificationPendingProps {
  email: string;
  onResendSuccess?: () => void;
  onResendError?: (error: string) => void;
}

export default function EmailVerificationPending({
  email,
  onResendSuccess,
  onResendError,
}: EmailVerificationPendingProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resendVerification } = useAuth();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const success = await resendVerification();

      if (success) {
        setResendSuccess(true);
        onResendSuccess?.();

        // Clear success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        onResendError?.("Failed to resend verification email");
      }
    } catch {
      onResendError?.("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link to <strong>{email}</strong>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verify your email address</CardTitle>
          <CardDescription>
            Click the verification link in your email to complete your
            registration and start using TravelSmart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What happens next?</p>
                <ul className="mt-2 space-y-1">
                  <li>• Click the verification link in your email</li>
                  <li>• You&apos;ll be automatically logged in</li>
                  <li>• Start planning your first trip!</li>
                </ul>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Verification email sent successfully! Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Didn&apos;t receive the email? Check your spam folder or resend
              the verification email.
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Having trouble? Contact our support team at{" "}
          <a
            href="mailto:support@travelsmart.com"
            className="text-blue-600 hover:underline"
          >
            support@travelsmart.com
          </a>
        </p>
      </div>
    </div>
  );
}
