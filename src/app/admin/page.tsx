"use client";

import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { Chart } from "primereact/chart";

// 🟢 Import API alias
import { LaporanOprasional as LaporanPerkara } from "@/components/feature/perkara/api";
import { LaporanOprasional as LaporanBanding } from "@/components/feature/banding/api";
import { LaporanOprasional as LaporanKasasi } from "@/components/feature/kasasi/api";
import { LaporanOprasional as LaporanPK } from "@/components/feature/peninjauan-kembali/api";

export default function DashboardPage() {
  const { data: perkaraData, isLoading: loadingPerkara } = LaporanPerkara();
  const { data: bandingData, isLoading: loadingBanding } = LaporanBanding();
  const { data: kasasiData, isLoading: loadingKasasi } = LaporanKasasi();
  const { data: pkData, isLoading: loadingPK } = LaporanPK();

  const isLoading = loadingPerkara || loadingBanding || loadingKasasi || loadingPK;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );

  const laporan = {
    perkara: perkaraData?.data,
    banding: bandingData?.data,
    kasasi: kasasiData?.data,
    pk: pkData?.data,
  };

  const COLORS = ["#0B5C4D", "#219EBC", "#FFB703", "#FB8500", "#8ECAE6", "#023047"];

  const chartOptions = {
    plugins: { legend: { labels: { color: "#333" } } },
    scales: {
      x: { ticks: { color: "#666" }, grid: { color: "#eee" } },
      y: { ticks: { color: "#666" }, grid: { color: "#eee" } },
    },
  };

  // Helper untuk bikin chart section biar DRY
  const ChartSection = ({
    title,
    total,
    per_status,
    per_bulan,
    per_keputusan,
    per_petugas,
  }: any) => {
    const pieData = {
      labels: per_status?.map((s: any) => s.status),
      datasets: [{ data: per_status?.map((s: any) => s.jumlah), backgroundColor: COLORS }],
    };

    const lineData = {
      labels: per_bulan?.map((b: any) => b.bulan),
      datasets: [
        {
          label: "Jumlah per Bulan",
          data: per_bulan?.map((b: any) => b.jumlah),
          fill: false,
          borderColor: "#0B5C4D",
          tension: 0.3,
        },
      ],
    };

    const barKeputusan = {
      labels: per_keputusan?.map((k: any) => k.keputusan),
      datasets: [
        {
          label: "Jumlah Keputusan",
          backgroundColor: "#0B5C4D",
          data: per_keputusan?.map((k: any) => k.jumlah),
        },
      ],
    };

    const barPetugas = {
      labels: per_petugas?.map((p: any) => p.petugas),
      datasets: [
        {
          label: "Jumlah Input",
          backgroundColor: "#219EBC",
          data: per_petugas?.map((p: any) => p.jumlah),
        },
      ],
    };

    return (
      <Card className="p-6 shadow-lg space-y-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-[#0B5C4D]">{title}</h2>
          <p className="text-gray-600">
            Total Data:{" "}
            <span className="text-[#0B5C4D] font-semibold">{total ?? 0}</span>
          </p>
        </div>

        <Divider />

        {/* Chart Layout 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🥧 Status */}
          <Card className="shadow-md p-5">
            <h3 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
              Berdasarkan Status
            </h3>
            <Chart type="pie" data={pieData} />
          </Card>

          {/* 📈 Bulan */}
          <Card className="shadow-md p-5">
            <h3 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
              Tren per Bulan
            </h3>
            <Chart type="line" data={lineData} options={chartOptions} />
          </Card>

          {/* 📊 Keputusan */}
          <Card className="shadow-md p-5">
            <h3 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
              Berdasarkan Keputusan
            </h3>
            <Chart type="bar" data={barKeputusan} options={chartOptions} />
          </Card>

          {/* 🧑‍💼 Petugas Input */}
          <Card className="shadow-md p-5">
            <h3 className="text-lg font-semibold mb-3 text-[#0B5C4D]">
              Aktivitas Petugas Input
            </h3>
            <Chart
              type="bar"
              data={barPetugas}
              options={{ ...chartOptions, indexAxis: "y" }}
            />
          </Card>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-[#0B5C4D] mb-4 text-center">
        📊 Dashboard Laporan Operasional
      </h1>

      {/* 🔹 PERKARA */}
      <ChartSection
        title="Laporan Perkara"
        total={laporan.perkara?.total_perkara}
        per_status={laporan.perkara?.per_status}
        per_bulan={laporan.perkara?.per_bulan}
        per_keputusan={laporan.perkara?.per_keputusan}
        per_petugas={laporan.perkara?.per_petugas}
      />

      {/* 🔹 BANDING */}
      <ChartSection
        title="Laporan Banding"
        total={laporan.banding?.total_banding}
        per_status={laporan.banding?.per_status}
        per_bulan={laporan.banding?.per_bulan}
        per_keputusan={laporan.banding?.per_keputusan}
        per_petugas={laporan.banding?.per_petugas}
      />

      {/* 🔹 KASASI */}
      <ChartSection
        title="Laporan Kasasi"
        total={laporan.kasasi?.total_kasasi}
        per_status={laporan.kasasi?.per_status}
        per_bulan={laporan.kasasi?.per_bulan}
        per_keputusan={laporan.kasasi?.per_keputusan}
        per_petugas={laporan.kasasi?.per_petugas}
      />

      {/* 🔹 PENINJAUAN KEMBALI */}
      <ChartSection
        title="Laporan Peninjauan Kembali"
        total={laporan.pk?.total_pk}
        per_status={laporan.pk?.per_status}
        per_bulan={laporan.pk?.per_bulan}
        per_keputusan={laporan.pk?.per_keputusan}
        per_petugas={laporan.pk?.per_petugas}
      />
    </div>
  );
}
