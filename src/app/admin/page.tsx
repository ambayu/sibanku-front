"use client";
import { LaporanPerkara } from "@/components/feature/perkara/api";

export default function DashboardPage() {

  const { data:dataLaporanPerkara, isLoading: isLoadingLaporanPerkara } = LaporanPerkara();
  console.log(dataLaporanPerkara,"asdasd");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-3xl font-bold">5</p>
          <p className="text-gray-500">Belum Diproses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-3xl font-bold">4</p>
          <p className="text-gray-500">Sedang Berlangsung</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-3xl font-bold">4</p>
          <p className="text-gray-500">Selesai</p>
        </div>
      </div>
    </div>
  );
}
