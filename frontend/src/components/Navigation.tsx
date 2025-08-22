"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal, UserMenu } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: null },
    { name: "Create Itinerary", href: "/create", icon: Plus },
    { name: "My Itineraries", href: "/itineraries", icon: MapPin },
    // { name: "Traveler Test", href: "/traveler-test", icon: Wand2 },
  ];

  const navItems = [...navigation];

  const openLoginModal = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and primary navigation */}
            <div className="flex">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <MapPin className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    TravelSmart
                  </span>
                </div>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                        isActivePath(item.href)
                          ? "border-yellow-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 mr-2" />}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - Auth buttons or user menu */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={openLoginModal}
                    disabled={isLoading}
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={openRegisterModal}
                    disabled={isLoading}
                    className="bg-sky-500 hover:bg-sky-700 rounded-full h-10 px-6 font-semibold shadow-md"
                  >
                    Sign up
                  </Button>
                </div>
              ) : (
                <UserMenu />
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {/* Mobile navigation links */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center px-3 py-2 text-base font-medium transition-colors",
                      isActivePath(item.href)
                        ? "bg-yellow-50 border-r-4 border-yellow-500 text-yellow-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5 mr-3" />}
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile auth section */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {!isAuthenticated ? (
                  <div className="px-3 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={openLoginModal}
                      disabled={isLoading}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Sign in
                    </Button>
                    <Button
                      className="w-full bg-sky-500 hover:bg-sky-700 rounded-full h-10 font-semibold shadow-md"
                      onClick={openRegisterModal}
                      disabled={isLoading}
                    >
                      Sign up
                    </Button>
                  </div>
                ) : (
                  <div className="px-3">
                    <UserMenu />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Navigation;
