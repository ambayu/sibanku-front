import TableComponent from "@/components/feature/laporan/banding/table";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Laporan banding | Data banding",
  description: "Data banding",
};

export default function banding() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Laporan banding | Data banding
              </h2>
              <p className="text-black text-sm">
                Data dan kelola data banding di sistem
              </p>
            </div>
        
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
