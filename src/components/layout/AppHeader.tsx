"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu, Sun, Moon } from "lucide-react";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white text-gray-900  shadow flex items-center justify-between px-6 h-16 transition-colors">
      {/* Left: Sidebar toggle + Title */}
      <div className="flex items-center">
        <button
          onClick={() =>
            window.innerWidth >= 1024 ? toggleSidebar() : toggleMobileSidebar()
          }
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 font-semibold hidden sm:block">Dashboard</h1>
      </div>

      {/* Right: Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-gray-100  transition-colors"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>
    </header>
  );
}
