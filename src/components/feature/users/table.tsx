"use client";

import DataTable from "@/components/ui/DataTable";
import { findAll, remove } from "./api";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useState } from "react";
import { useAlert } from "@/context/AlertContext"; // ⬅️ hook dari context alert-mu

export default function UserTable() {
  const { data: dataUsers, isLoading } = findAll(1, 10);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { showAlert } = useAlert(); // ✅ ambil fungsi showAlert

  // Handler hapus user
  const handleDelete = async (id: number) => {
    try {
      setLoadingId(id);
      await remove(id);
      showAlert("success", "User berhasil dihapus ✅"); // ✅ pakai showAlert
    } catch (err: any) {
      showAlert("error", err.message || "Gagal menghapus user ❌"); // ✅ pakai showAlert
    } finally {
      setLoadingId(null);
    }
  };

  // Handler edit (sementara pakai alert dulu)
  const handleEdit = (id: number) => {
    showAlert("info", `Edit user dengan ID: ${id}`); // ✅ pakai showAlert
    // contoh: router.push(`/admin/users/edit/${id}`);
  };

  // Tampilkan dialog konfirmasi sebelum delete
  const confirmDelete = (id: number) => {
    confirmDialog({
      message: "Apakah Anda yakin ingin menghapus user ini?",
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      accept: () => handleDelete(id),
    });
  };

  return (
    <div className="p-6">
      {/* Dialog konfirmasi */}
      <ConfirmDialog />

      <DataTable
        data={dataUsers?.data || []}
        isLoading={isLoading}
        columns={[
          { header: "No", accessor: "no" },
          { header: "Nama", accessor: "name" },
          { header: "Email", accessor: "email" },
          { header: "Username", accessor: "username" },
          {
            header: "Role",
            accessor: "roles",
            render: (roles: any[]) =>
              Array.isArray(roles)
                ? roles.map((r) => (r.name ? r.name : r)).join(", ")
                : "-",
          },
          {
            header: "Actions",
            accessor: "id",
            render: (_: any, row: any) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  severity="info"
                  
                  onClick={() => handleEdit(row.id)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  loading={loadingId === row.id}
                  onClick={() => confirmDelete(row.id)}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
