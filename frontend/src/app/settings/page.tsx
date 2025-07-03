'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Settings, 
  ArrowLeft, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard,
  User,
  MapPin
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const comingSoonFeatures = [
    {
      icon: Bell,
      title: 'Notification Preferences',
      description: 'Manage email and push notifications for your trips and account updates'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Control your profile visibility, data sharing, and account security settings'
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'Set your preferred language, currency, and regional preferences'
    },
    {
      icon: MapPin,
      title: 'Travel Preferences',
      description: 'Configure your travel style, dietary restrictions, and accessibility needs'
    },
    {
      icon: CreditCard,
      title: 'Subscription Management',
      description: 'Manage your subscription plan and billing information'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="p-2">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and privacy settings</p>
          </div>
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Advanced Settings Coming Soon</CardTitle>
            <CardDescription>
              We&apos;re working on building comprehensive settings to give you full control over your TravelSmart experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comingSoonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-600">{feature.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                In the meantime, you can manage your basic profile information from your profile page.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Now</CardTitle>
            <CardDescription>
              Basic settings you can manage today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Profile Information</h4>
                  <p className="text-sm text-gray-600">Update your name, username, bio, and basic details</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">
                    Manage
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Email Verification</h4>
                  <p className="text-sm text-gray-600">
                    Verify your email address to access all features
                    {user.email_verified && (
                      <span className="text-green-600 ml-1">✓ Verified</span>
                    )}
                  </p>
                </div>
                {!user.email_verified && (
                  <Button variant="outline" size="sm" disabled>
                    Check Email
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Account Status</h4>
                  <p className="text-sm text-gray-600">
                    Your account is currently <span className="font-medium">{user.status}</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Active
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 