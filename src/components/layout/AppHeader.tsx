"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext"; // context theme yang kita buat sebelumnya
import { Menu, Sun, Moon } from "lucide-react";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background text-foreground shadow flex items-center justify-between px-6 h-16">
      {/* Bagian kiri: tombol toggle sidebar + title */}
      <div className="flex items-center">
        <button
          onClick={() =>
            window.innerWidth >= 1024 ? toggleSidebar() : toggleMobileSidebar()
          }
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="ml-4 font-semibold">Dashboard</h1>
      </div>

      {/* Bagian kanan: tombol toggle tema */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-foreground" />
        )}
      </button>
    </header>
  );
}
