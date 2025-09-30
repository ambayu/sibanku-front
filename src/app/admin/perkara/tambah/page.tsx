import FormComponent from "@/components/feature/perkara/form-tambah";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Perkara | Formulir Perkara",
  description: "Silahkan isi formulir Perkara",
};

export default function Perkara() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 ">
                Tambah Perkara | Formulir Perkara
              </h2>
              <p className="text-gray-800 text-sm">
                Silahkan isi formulir Perkara
              </p>
            </div>
            <Link href="/admin/perkara">
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
