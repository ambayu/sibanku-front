"use client";

import DataTable from "@/components/ui/DataTable";
import { findAll, remove } from "./api";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useState } from "react";
import { useAlert } from "@/context/AlertContext"; // ⬅️ hook dari context alert-mu
import { useRouter } from "next/navigation";

export default function RoleTable() {
  const { data: dataRoles, isLoading, mutate } = findAll(1, 10000000000);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { showAlert } = useAlert(); // ✅ ambil fungsi showAlert
  const router = useRouter();
  // Handler hapus role
  const handleDelete = async (id: number) => {
    try {
      setLoadingId(id);
      await remove(id);
      mutate();
      showAlert("success", "Role berhasil dihapus ✅"); // ✅ pakai showAlert
    } catch (err: any) {
      showAlert("error", err.message || "Gagal menghapus role ❌"); // ✅ pakai showAlert
    } finally {
      setLoadingId(null);
    }
  };

  // Handler edit (sementara pakai alert dulu)


  // Tampilkan dialog konfirmasi sebelum delete
  const confirmDelete = (id: number) => {
    confirmDialog({
      message: "Apakah Anda yakin ingin menghapus role ini?",
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
        data={dataRoles?.data || []}
        isLoading={isLoading}
        columns={[
          { header: "No", accessor: "no" },
          { header: "Nama", accessor: "name" },

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

                  onClick={() => {
                    router.push(`/admin/role/edit/${row.id}`);
                  }}
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
