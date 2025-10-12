import TableComponent from "@/components/feature/users/profile";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Profile | Lihat Profile",
  description: "Lihat Profile",
};

export default function Profile() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Manajemen Profile | Lihat Profile
              </h2>
              <p className="text-gray-500 text-sm">
                Lihat dan kelola data Profile di sistem
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
