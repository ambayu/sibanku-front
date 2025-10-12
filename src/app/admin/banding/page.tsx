import Can from "@/components/common/Can";
import TableComponent from "@/components/feature/banding/table";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Banding | Lihat Banding",
  description: "Lihat Banding",
};

export default function Banding() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Manajemen Banding | Lihat Banding
              </h2>
              <p className="text-black text-sm">
                Lihat dan kelola data Banding di sistem
              </p>
            </div>
            <Can permission={"banding:manage"}>
              <Link href="/admin/banding/tambah">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0B5C4D] rounded hover:bg-[#094c3f]"
                  type="button"
                >
                  Tambah Banding
                </button>
              </Link>
            </Can>
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
