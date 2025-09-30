import FormComponent from "@/components/feature/pengaduan/form-tambah";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Pengaduan | Formulir Pengaduan",
  description: "Silahkan isi formulir Pengaduan",
};

export default function TanyaAhli() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Tambah Pengaduan | Formulir Pengaduan
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Silahkan isi formulir Pengaduan
              </p>
            </div>
            <Link href="/admin/pengaduan">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-[#0B5C4D] rounded hover:bg-[#094c3f]"
                type="button"
              >
               Kembali
              </button>
            </Link>
          </div>

          {/* Content */}
          <div className="p-2">
            <FormComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
