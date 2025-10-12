"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

// ===========================
// 🔹 TYPE DEFINITIONS
// ===========================
type MenuItem = {
  name: string;
  path?: string;
  permission?: string;
  children?: { name: string; path: string; permission?: string }[];
};

type MenuGroup = {
  label?: string;
  items: MenuItem[];
};

// ===========================
// 🔹 MENU STRUCTURE
// ===========================
const menuGroups: MenuGroup[] = [
  {
    label: "Menu Utama",
    items: [
      { name: "Dashboard", path: "/admin" },
      { name: "Perkara", path: "/admin/perkara", permission: "perkara:view" },
      { name: "Banding", path: "/admin/banding", permission: "banding:view" },
      { name: "Kasasi", path: "/admin/kasasi", permission: "kasasi:view" },
      {
        name: "Peninjauan Kembali",
        path: "/admin/peninjauan-kembali",
        permission: "peninjauan-kembali:view",
      },
      {
        name: "Laporan",
        permission: "laporan:view",
        children: [
          { name: "Laporan Perkara", path: "/admin/laporan/perkara", permission: "laporan:view" },
          { name: "Laporan Banding", path: "/admin/laporan/banding", permission: "laporan:view" },
          { name: "Laporan Kasasi", path: "/admin/laporan/kasasi", permission: "laporan:view" },
          { name: "Laporan Peninjauan Kembali", path: "/admin/laporan/peninjauan-kembali", permission: "laporan:view" },
        ],
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        name: "User Management",
        permission: "user:view",
        children: [
          { name: "Daftar User", path: "/admin/users", permission: "user:view" },
        ],
      },
      {
        name: "Role and Permission",
        permission: "role:view",
        children: [
          { name: "Permission", path: "/admin/permissions", permission: "permission:view" },
          { name: "Role", path: "/admin/role", permission: "role:view" },
        ],
      },
    ],
  },
];

// ===========================
// 🔹 SIDEBAR COMPONENT
// ===========================
export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userPermissions: string[] = session?.user?.permissions || [];

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const canAccess = (permission?: string) => {
    if (!permission) return true;
    return userPermissions.includes(permission);
  };

  const isActive = (path: string) => pathname.startsWith(path);
  const getSidebarWidth = () => (isMobileOpen || isExpanded || isHovered ? "w-[250px]" : "w-[80px]");
  const shouldShowText = isExpanded || isHovered || isMobileOpen;
  const toggleDropdown = (name: string) => setOpenDropdown((prev) => (prev === name ? null : name));

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <>
      {/* Overlay untuk Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full 
        bg-[#0B5C4D] text-white 
        flex flex-col justify-between transition-all duration-300 z-50 
        ${getSidebarWidth()}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* HEADER */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            {shouldShowText && (
              <div>
                <h1 className="text-base font-bold truncate">SIBANKUM</h1>
                <p className="text-xs text-white/70 truncate">
                  Sistem Informasi Bantuan Hukum
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 flex flex-col gap-3 pl-3 pr-0 py-3 overflow-y-auto">
          {menuGroups.map((group, i) => {
            const visibleItems = group.items.filter(
              (item) =>
                canAccess(item.permission) ||
                item.children?.some((c) => canAccess(c.permission))
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={i} className="flex flex-col gap-1">
                {shouldShowText && group.label && (
                  <span className="text-[11px] uppercase font-semibold text-white/60 px-2 mb-1 tracking-wide">
                    {group.label}
                  </span>
                )}

                {visibleItems.map((item) => {
                  const active = item.path ? isActive(item.path) : false;
                  const isOpen = openDropdown === item.name;

                  if (item.children && item.children.length > 0) {
                    const visibleChildren = item.children.filter((c) => canAccess(c.permission));
                    if (visibleChildren.length === 0) return null;

                    return (
                      <div key={item.name} className="flex flex-col">
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-l-full transition-all duration-200 w-full text-left text-sm
                            ${isOpen || active
                              ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                              : "text-white/90 hover:bg-white/10"
                            }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full flex-shrink-0 transition-colors
                              ${isOpen || active ? "bg-orange-500" : "bg-orange-400/70"}`}
                          />
                          {shouldShowText && (
                            <>
                              <span className="flex-1">{item.name}</span>
                              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </>
                          )}
                        </button>

                        {isOpen && shouldShowText && (
                          <div className="ml-6 flex flex-col gap-1 py-1.5">
                            {visibleChildren.map((child) => {
                              const childActive = isActive(child.path!);
                              return (
                                <Link
                                  key={child.name}
                                  href={child.path!}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-l-full transition-all duration-200 text-xs
                                    ${childActive
                                      ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                                      : "text-white/80 hover:bg-white/10"
                                    }`}
                                >
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors
                                      ${childActive ? "bg-orange-500" : "bg-orange-400/70"}`}
                                  />
                                  <span>{child.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.path!}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-l-full transition-all duration-200 text-sm
                        ${active
                          ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                          : "text-white/90 hover:bg-white/10"
                        }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full flex-shrink-0 transition-colors
                          ${active ? "bg-orange-500" : "bg-orange-400/70"}`}
                      />
                      {shouldShowText && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-3">
          <Link
            href="/admin/profile"
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-white/90 hover:bg-white/10 transition"
          >
            <User className="h-5 w-5 flex-shrink-0" />
            {shouldShowText && <span>Profil</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-red-300 hover:bg-white/10 transition"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {shouldShowText && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
