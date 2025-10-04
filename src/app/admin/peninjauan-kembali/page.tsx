import TableComponent from "@/components/feature/peninjauan-kembali/table";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Peninjauan Kembali | Lihat Peninjauan Kembali",
  description: "Lihat Peninjauan Kembali",
};

export default function Peninjauan_Kembali() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Manajemen Peninjauan Kembali | Lihat Peninjauan Kembali
              </h2>
              <p className="text-black text-sm">
                Lihat dan kelola data Peninjauan Kembali di sistem
              </p>
            </div>
            <Link href="/admin/peninjauan-kembali/tambah">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-[#0B5C4D] rounded hover:bg-[#094c3f]"
                type="button"
              >
                Tambah Peninjauan Kembali
              </button>
            </Link>
          </div>

          {/* Content */}
          <div className="p-4">
            <TableComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
