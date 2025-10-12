"use client";

import { useSession } from "next-auth/react";
import React from "react";

/**
 * 🔒 Komponen Can
 * Digunakan untuk mengontrol akses berbasis permission atau role.
 *
 * Contoh penggunaan:
 *  <Can permission="perkara:manage">
 *    <button>Edit Perkara</button>
 *  </Can>
 *
 *  <Can permission={["laporan:view", "laporan:edit"]} role="admin">
 *    <Dashboard />
 *  </Can>
 *
 *  <Can not permission="user:delete">
 *    <p>Kamu tidak boleh menghapus user</p>
 *  </Can>
 */

interface CanProps {
    permission?: string | string[];
    role?: string | string[];
    not?: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function Can({
    permission,
    role,
    not = false,
    children,
    fallback = null,
}: CanProps) {
    const { data: session, status } = useSession();

    // Tunggu sampai session siap
    if (status === "loading") return null;

    const userPermissions = session?.user?.permissions || [];
    const userRoles = session?.user?.roles || [];

    let allowed = true;

    // ✅ Cek permission
    if (permission) {
        const perms = Array.isArray(permission) ? permission : [permission];
        allowed = perms.some((perm) => userPermissions.includes(perm));
    }

    // ✅ Cek role (jika ada)
    if (role) {
        const roles = Array.isArray(role) ? role : [role];
        const hasRole = roles.some((r) => userRoles.includes(r));
        allowed = allowed || hasRole;
    }

    // 🔁 Jika prop "not" = true, balik hasilnya
    if (not) allowed = !allowed;

    // 🎯 Render children atau fallback
    if (allowed) return <>{children}</>;
    return <>{fallback}</>;
}
