// components/layout/Header.tsx

import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const routes = [
    { name: "Workout", path: "/" },
    { name: "Sleep", path: "/sleep" },
    { name: "Nutrition", path: "/nutrition" },
    { name: "Stress", path: "/stress" },
    { name: "Muscles", path: "/muscles" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Health Tracker</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden space-x-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "font-medium transition-colors hover:text-gray-200",
                  location.pathname === route.path
                    ? "underline decoration-2 underline-offset-4"
                    : "",
                )}
              >
                {route.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="text-white md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="pt-4 pb-2 md:hidden">
            <div className="flex flex-col space-y-3">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={cn(
                    "hover:bg-primary-foreground/10 rounded px-4 py-2 font-medium transition-colors",
                    location.pathname === route.path ? "bg-primary-foreground/20" : "",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
