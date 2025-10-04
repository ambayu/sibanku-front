"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu, Sun, Moon, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Aman untuk session.user bertipe string atau object
  const userData =
    typeof session?.user === "string"
      ? { name: session.user }
      : session?.user;

  const userName = userData?.name || "Pengguna";
  const userEmail = (userData as any)?.email || "";
  
  // 🔧 Beri tahu TypeScript bahwa userData bisa punya properti tambahan
  const userDataSafe = userData as {
    name?: string;
    role?: string;
    roles?: { name?: string }[] | string[];
  };

  // 🔹 Ambil role secara aman (baik array of object maupun array of string)
  const userRole =
    (Array.isArray(userDataSafe.roles)
      ? (userDataSafe.roles[0] as any)?.name || (userDataSafe.roles[0] as any)
      : userDataSafe.role) || "User";

  // Avatar fallback dari nama user
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-gray-900 shadow-md flex items-center justify-between px-6 h-16 transition-colors border-b border-gray-200">
      {/* Left: Sidebar toggle + Title */}
      <div className="flex items-center">
        <button
          onClick={() =>
            window.innerWidth >= 1024 ? toggleSidebar() : toggleMobileSidebar()
          }
          className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Page Title - bisa disesuaikan dengan halaman aktif */}
        <div className="ml-4">
          <h1 className="text-lg font-semibold text-gray-800">
            {/* Dashboard */}
          </h1>
        </div>
      </div>

      {/* Right: User Info + Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-gray-600" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-500" />
          )}
        </button>

        {/* User Profile dengan Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-3  hover:bg-gray-100 px-3 py-2 rounded-xl transition-all duration-200 border "
          >
            {/* Avatar Circle */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-[#0B5C4D] to-[#1a936f] text-white font-medium text-sm">
              {getInitials(userName)}
            </div>
            
            {/* User Info - hidden on mobile */}
            <div className="hidden sm:block text-left">
              <p className="font-medium text-gray-800 text-sm leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {userRole}
              </p>
            </div>
            
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isUserDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              {/* User Summary */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800 truncate">
                  {userName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {userEmail}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {userRole}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <User className="h-4 w-4" />
                  Profile Saya
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </button>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-gray-100">
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}