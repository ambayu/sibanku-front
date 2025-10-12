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



export default function KasasiPage() {
  const route = useRouter();
  const { showAlert } = useAlert();

  const { data: dataKasasi, isLoading, mutate } = RealfindAll("");
  console.log(dataKasasi, "data kasasi");
  return (
    <div className="p-6">
      <ConfirmDialog />
      <DataTable
        isLoading={isLoading}
        data={dataKasasi}
        columns={[
          { header: "No", accessor: "no" },
          { header: "Nomor Kasasi", accessor: "nomor_kasasi" },
          {
            header: "Nomor Bandings",
            accessor: "nomor_banding",
            render: (_: any, row: any) => row.banding?.nomor_banding || "-",
          },
          {
            header: "Nomor Perkara",
            accessor: "nomor_perkara",
            render: (_: any, row: any) => row.banding?.perkara?.nomor_perkara || "-",
          },

          {
            header: "Pihak",
            accessor: "pihak",
            render: (_: any, row: any) => row.banding?.perkara?.pihak || "-",
          },
          {
            header: "Panitra Pengganti",
            accessor: "panitra_pengganti",
            render: (_: any, row: any) => row.banding?.perkara?.panitra_pengganti || "-",
          },
          {
            header: "Penanggung Jawab",
            accessor: "penanggung_jawabs",
            render: (_: any, row: any) =>
              row.banding?.perkara?.penanggung_jawabs?.length
                ? row.banding?.perkara?.penanggung_jawabs?.map((pj: any) => pj.nama).join(", ")
                : "-",
          },
          { header: "Status", accessor: "status" },
          { header: "Keputusan", accessor: "keputusan" },
          {
            header: "Dibuat Oleh",
            accessor: "createdByUser.name",
            render: (_: any, row: any) => row.createdByUser?.name || "-",
          },
          {
            header: "Diubah Oleh",
            accessor: "updatedByUser.name",
            render: (_: any, row: any) => row.updatedByUser?.name || "-",
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
                  tooltip="Edit Kasasi"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/kasasi/edit/${row.id}`);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  tooltip="Hapus Kasasi"
                  tooltipOptions={{
                    position: "bottom",
                  }}
                  size="small"
                  severity="danger"
                  onClick={() => {
                    confirmDialog({
                      message: "Apakah Anda yakin ingin menghapus kasasi ini?",
                      header: "Konfirmasi Hapus",
                      icon: "pi pi-exclamation-triangle",
                      acceptLabel: "Ya, Hapus",
                      rejectLabel: "Batal",
                      accept: async () => {
                        try {
                          await remove(row.id);
                          mutate();
                          showAlert("success", "Kasasi berhasil dihapus ✅");
                        } catch (error: any) {
                          showAlert("error", error.message || "Gagal menghapus kasasi");
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
                  tooltip="Lihat Kasasi"
                  tooltipOptions={{
                    position: "bottom",
                  }}

                  onClick={() => {
                    route.push(`/admin/kasasi/view/${row.id}`);
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
