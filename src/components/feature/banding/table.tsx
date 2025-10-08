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



export default function BandingPage() {
  const route = useRouter();
  const { showAlert } = useAlert();

  const { data: dataBanding, isLoading, mutate } = RealfindAll("");
  console.log(dataBanding);
  return (
    <div className="p-6">
      <ConfirmDialog />
      <DataTable
        isLoading={isLoading}
        data={dataBanding}
        columns={[
          { header: "No", accessor: "no" },
          { header: "Nomor Banding", accessor: "nomor_banding"},
          { header: "Nomor Perkara", accessor: "nomor_perkara", render: (_: any, row: any) => row.perkara?.nomor_perkara || "-" },
          { header: "Pihak", accessor: "pihak", render: (_: any, row: any) => row.perkara?.pihak || "-" },
          { header: "Panitra Pengganti", accessor: "panitra_pengganti", render: (_: any, row: any) => row.perkara?.panitra_pengganti || "-" },
          {
            header: "Penanggung Jawab", accessor: "penanggung_jawabs", render: (_: any, row: any) => row.perkara?.penanggung_jawabs.map((pj: any) => pj.nama).join(", ")


          },
          { header: "Status", accessor: "status" },

          { header: "Dibuat Oleh", accessor: "CreatedByUser.name", render: (_: any, row: any) => row.createdByUser?.name || "-" },
          { header: "DiUbah Oleh", accessor: "UpdatedByUser.name", render: (_: any, row: any) => row.updatedByUser?.name || "-" },

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
                  tooltip="Edit Banding"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/banding/edit/${row.id}`);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  tooltip="Hapus Banding"
                  tooltipOptions={{
                    position: "bottom",
                  }}
                  size="small"
                  severity="danger"
                  onClick={() => {
                    confirmDialog({
                      message: "Apakah Anda yakin ingin menghapus banding ini?",
                      header: "Konfirmasi Hapus",
                      icon: "pi pi-exclamation-triangle",
                      acceptLabel: "Ya, Hapus",
                      rejectLabel: "Batal",
                      accept: async () => {
                        try {
                          await remove(row.id);
                          mutate();

                          showAlert("success", "Banding berhasil dihapus ✅");
                        } catch (error: any) {
                          showAlert("error", error.message || "Gagal menghapus banding");
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
                  tooltip="Lihat Banding"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/banding/view/${row.id}`);
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
