'use client';

import { useState } from 'react';
import { CheckCircle, X, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  const handleLoginSuccess = () => {
    // Close modal on successful login
    onClose();
  };

  const handleRegistrationSuccess = () => {
    // Show registration success message instead of closing
    setShowRegistrationSuccess(true);
  };

  const handleClose = () => {
    // Reset states when closing
    setActiveTab(defaultTab);
    setShowRegistrationSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        {showRegistrationSuccess ? (
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold">Account created successfully!</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                Welcome to TravelSmart! Please verify your email to get started.
              </p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-medium">Check your email for verification</p>
                  <p className="text-sm">
                    We&apos;ve sent a verification email to your inbox. Click the link in the email or copy the token to verify your account.
                  </p>
                  <p className="text-sm">
                    Once verified, you can access all TravelSmart features including creating and managing your itineraries.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3 mt-6">
              <Button onClick={handleClose} className="flex-1">
                Continue to App
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRegistrationSuccess(false);
                  setActiveTab('login');
                }}
                className="flex-1"
              >
                Sign In
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 