"use client";

import React, { useState } from "react";

type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T, index: number) => React.ReactNode; // custom renderer opsional
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSizeOptions?: number[];
  isLoading?: boolean;
};

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSizeOptions = [5, 10, 20],
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(pageSizeOptions[1] || 10);
  const [page, setPage] = useState(1);

  // Filter data by search
  const filtered = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="bg-white rounded-lg shadow p-3 space-y-3 text-sm">
      {/* Top controls */}
      <div className="flex flex-col md:flex-row justify-between gap-3 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-gray-600">
            Show
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-gray-600">entries</span>
        </div>

        <div>
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-1 w-40 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#0B5C4D] text-white text-xs uppercase">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-3 py-2 text-left font-semibold tracking-wide"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {isLoading ? (
              // Skeleton
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((_, i) => (
                    <td key={i} className="px-3 py-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length > 0 ? (
              paginated.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-2 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(
                            row[col.accessor],
                            row,
                            startIndex + rowIndex
                          )
                        : col.accessor === "no"
                        ? startIndex + rowIndex + 1
                        : Array.isArray(row[col.accessor])
                        ? row[col.accessor]
                            .map((item: any) =>
                              typeof item === "string" ? item : item.name
                            )
                            .join(", ")
                        : typeof row[col.accessor] === "object" &&
                          row[col.accessor] !== null
                        ? JSON.stringify(row[col.accessor])
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-400 text-sm"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex justify-end items-center gap-2 text-xs text-gray-600">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Halaman {page} dari {totalPages || 1}
          </span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
