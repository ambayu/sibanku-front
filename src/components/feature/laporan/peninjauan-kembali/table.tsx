"use client";

import DataTable from "@/components/ui/DataTable";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { LaporanOprasional } from "../../peninjauan-kembali/api";

export default function LaporanOperasionalPKTable() {
  const { data, isLoading } = LaporanOprasional();
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );

  if (!data)
    return (
      <div className="text-center py-10 text-gray-500">
        Tidak ada data laporan Peninjauan Kembali.
      </div>
    );

  const laporan = data?.data || {};

  return (
    <div className="p-6 space-y-8">
      {/* 🔹 HEADER INFO */}
      <Card className="shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-[#0B5C4D]">
          Laporan Operasional Peninjauan Kembali
        </h1>
        <p className="text-gray-600">
          Total Peninjauan Kembali:{" "}
          <span className="font-semibold text-black">
            {laporan.total_pk ?? 0}
          </span>
        </p>
      </Card>

      <Divider />

      {/* 🔹 STATUS */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Rekap PK Berdasarkan Status
        </h2>
        <DataTable
          data={laporan.per_status || []}
          columns={[
            {
              header: "No",
              accessor: "no",
              render: (_: any, __: any, index: number) => index + 1,
            },
            { header: "Status", accessor: "status" },
            { header: "Jumlah PK", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 KEPUTUSAN */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Rekap PK Berdasarkan Keputusan
        </h2>
        <DataTable
          data={laporan.per_keputusan || []}
          columns={[
            {
              header: "No",
              accessor: "no",
              render: (_: any, __: any, index: number) => index + 1,
            },
            { header: "Keputusan", accessor: "keputusan" },
            { header: "Jumlah PK", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 PER BULAN */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Jumlah PK per Bulan (12 Bulan Terakhir)
        </h2>
        <DataTable
          data={laporan.per_bulan || []}
          columns={[
            {
              header: "No",
              accessor: "no",
              render: (_: any, __: any, index: number) => index + 1,
            },
            { header: "Bulan", accessor: "bulan" },
            { header: "Jumlah PK", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 PER PETUGAS */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Jumlah PK per Petugas Input
        </h2>
        <DataTable
          data={laporan.per_petugas || []}
          columns={[
            {
              header: "No",
              accessor: "no",
              render: (_: any, __: any, index: number) => index + 1,
            },
            {
              header: "Nama Petugas",
              accessor: "petugas",
              render: (val: string) => val || "-",
            },
            { header: "Jumlah PK", accessor: "jumlah" },
          ]}
        />
      </Card>
    </div>
  );
}
