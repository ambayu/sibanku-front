"use client";

import DataTable from "@/components/ui/DataTable";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { LaporanOprasional } from "../../banding/api";

export default function LaporanOperasionalBandingTable() {
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
        Tidak ada data laporan banding.
      </div>
    );

  const laporan = data?.data || {};

  return (
    <div className="p-6 space-y-8">
      {/* 🔹 HEADER INFO */}
      <Card className="shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-[#0B5C4D]">
          Laporan Operasional Banding
        </h1>
        <p className="text-gray-600">
          Total Banding:{" "}
          <span className="font-semibold text-black">
            {laporan.total_banding ?? 0}
          </span>
        </p>
      </Card>

      <Divider />

      {/* 🔹 TABEL STATUS */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Rekap Banding Berdasarkan Status
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
            { header: "Jumlah Banding", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 TABEL KEPUTUSAN */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Rekap Banding Berdasarkan Keputusan
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
            { header: "Jumlah Banding", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 TABEL BULAN */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Jumlah Banding per Bulan (12 Bulan Terakhir)
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
            { header: "Jumlah Banding", accessor: "jumlah" },
          ]}
        />
      </Card>

      {/* 🔹 TABEL PETUGAS */}
      <Card className="shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
          Jumlah Banding per Petugas Input
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
            { header: "Jumlah Banding", accessor: "jumlah" },
          ]}
        />
      </Card>
    </div>
  );
}
