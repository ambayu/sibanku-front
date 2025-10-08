"use client";
import DataTable from "@/components/ui/DataTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { RealfindAll, remove } from "./api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { mutate } from "swr";
import { useAlert } from "@/context/AlertContext";
import { Tooltip } from "primereact/tooltip";

export default function PerkaraPage() {
  const route = useRouter();
  const { showAlert } = useAlert();

  const { data: dataPerkara, isLoading, mutate } = RealfindAll("");
  console.log(dataPerkara, "data perkara");
  return (
    <div className="p-6">
      <ConfirmDialog />
      <DataTable
        isLoading={isLoading}
        data={dataPerkara}
        columns={[
          { header: "No", accessor: "no" },
          { header: "Nomor Perkara", accessor: "nomor_perkara" },
          { header: "Pihak", accessor: "pihak" },
          { header: "Panitra Pengganti", accessor: "panitra_pengganti" },
          {
            header: "Penanggung Jawab", accessor: "penanggung_jawabs",

           render: (value) => value.map((pj: any) => pj.nama).join(", ")


          },
          { header: "Keputusan", accessor: "keputusan" },
          { header: "Status", accessor: "status" },

          { header: "Dibuat Oleh", accessor: "CreatedByUser.name", render: (_: any, row: any) => row.CreatedByUser?.name || "-" },
          { header: "DiUbah Oleh", accessor: "UpdatedByUser.name", render: (_: any, row: any) => row.UpdatedByUser?.name || "-" },

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
                  tooltip="Edit Perkara"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/perkara/edit/${row.id}`);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  tooltip="Hapus Perkara"
                  tooltipOptions={{
                    position: "bottom",
                  }}
                  size="small"
                  severity="danger"
                  onClick={() => {
                    confirmDialog({
                      message: "Apakah Anda yakin ingin menghapus perkara ini?",
                      header: "Konfirmasi Hapus",
                      icon: "pi pi-exclamation-triangle",
                      acceptLabel: "Ya, Hapus",
                      rejectLabel: "Batal",
                      accept: async () => {
                        try {
                          await remove(row.id);
                          mutate();
                          showAlert("success", "Perkara berhasil dihapus ✅");
                        } catch (error: any) {
                          showAlert("error", error.message || "Gagal menghapus perkara");
                        }
                      },
                    });
                  }}
                />
                <Button
                  icon="pi pi-play"
                  rounded
                  text
                  size="small"
                  severity="info"
                  tooltip="Lihat Perkara"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/perkara/view/${row.id}`);
                  }}
                />

              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
