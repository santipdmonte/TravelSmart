"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle } from "lucide-react";
import {
  passwordResetRequestSchema,
  PasswordResetRequestFormData,
} from "@/lib/validationSchemas";
import { requestPasswordReset } from "@/lib/authApi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordResetRequestFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function PasswordResetRequestForm({
  onSuccess,
  onSwitchToLogin,
}: PasswordResetRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await requestPasswordReset({ email: data.email });
      if (response.error) {
        setError(response.error);
      } else {
        setIsSuccess(true);
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Email Sent!</h3>
        <p className="text-sm text-muted-foreground">
          If an account with that email exists, we&apos;ve sent a link to reset
          your password.
        </p>
        <Button variant="outline" onClick={onSwitchToLogin} className="w-full">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={onSwitchToLogin}
          disabled={isLoading}
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}
