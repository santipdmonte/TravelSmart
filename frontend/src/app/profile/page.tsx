"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/validationSchemas";
import { updateUserProfile } from "@/lib/authApi";
import {
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateFormData>({
    first_name: "",
    last_name: "",
    display_name: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        display_name: user.display_name || "",
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

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

  const handleInputChange = (
    field: keyof ProfileUpdateFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Validate form data
      const validatedData = profileUpdateSchema.parse(formData);

      // Update profile
      await updateUserProfile(validatedData);

      // Refresh user data
      await refreshProfile();

      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ZodError" &&
        "errors" in error
      ) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        const zodError = error as {
          errors: Array<{ path?: string[]; message: string }>;
        };
        zodError.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update profile";
        setSaveError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      display_name: user.display_name || "",
      username: user.username || "",
      bio: user.bio || "",
    });
    setIsEditing(false);
    setErrors({});
    setSaveError(null);
  };

  const getUserInitials = (user: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    username?: string;
  }) => {
    const firstName =
      user.first_name || user.display_name || user.username || "";
    const lastName = user.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Profile updated successfully!
              </span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {user.display_name || user.username}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                    {user.email_verified ? (
                      <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 ml-2 text-red-500" />
                    )}
                  </CardDescription>
                  {user.traveler_type && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Traveler Type:</span>{" "}
                      <span>{user.traveler_type.name}</span>
                      {user.traveler_type.description && (
                        <p className="text-gray-600 mt-1">
                          {user.traveler_type.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={user.status === "active" ? "default" : "secondary"}
                >
                  {user.status}
                </Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="account">Account Details</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Manage your personal details and preferences
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b border-current mr-1" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {saveError && <ErrorMessage message={saveError} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) =>
                            handleInputChange("first_name", e.target.value)
                          }
                          className={errors.first_name ? "border-red-500" : ""}
                        />
                        {errors.first_name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.first_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-900">
                        {user.first_name || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) =>
                            handleInputChange("last_name", e.target.value)
                          }
                          className={errors.last_name ? "border-red-500" : ""}
                        />
                        {errors.last_name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-900">
                        {user.last_name || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) =>
                          handleInputChange("display_name", e.target.value)
                        }
                        className={errors.display_name ? "border-red-500" : ""}
                      />
                      {errors.display_name && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.display_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {user.display_name || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className={errors.username ? "border-red-500" : ""}
                      />
                      {errors.username && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.username}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {user.username || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <div>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        className={errors.bio ? "border-red-500" : ""}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.bio}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {user.bio || "No bio provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Email</Label>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-900">{user.email}</p>
                    {user.email_verified ? (
                      <Badge
                        variant="default"
                        className="ml-2 bg-green-100 text-green-800"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">
                        Not Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Account Status</Label>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Role</Label>
                      <div className="flex items-center mt-1">
                        <Shield className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{user.role}</span>
                      </div>
                    </div>

                    <div>
                      <Label>Subscription Type</Label>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">
                          {user.subscription_type || "Free"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Member Since</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Travel Statistics</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Trips Created:
                          </span>
                          <span className="font-medium">
                            {user.total_trips_created || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Trips Completed:
                          </span>
                          <span className="font-medium">
                            {user.total_trips_completed || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Onboarding Status</Label>
                      <div className="flex items-center mt-1">
                        {user.onboarding_completed ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Profile Visibility</Label>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">
                          {user.is_public_profile ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
