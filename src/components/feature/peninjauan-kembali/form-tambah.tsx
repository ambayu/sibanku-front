"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import DataTable from "@/components/ui/DataTable";
import { RealfindAll } from "../perkara/api";
import { useAlert } from "@/context/AlertContext";
import { create } from "./api";

export default function PeninjauanKembaliForm() {
    const { showAlert } = useAlert();
    const { data: dataPeninjauanKembali, isLoading: isLoadingPeninjauanKembali } = RealfindAll("");

    const [isLoading, setIsLoading] = useState(false);
    const [nomorPeninjauanKembali, setNomorPeninjauanKembali] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            nomor_pk: nomorPeninjauanKembali,
            id_perkara: selectedId
        }

        try {
            await create(payload);
            showAlert("success", `Nomor peninjauan kembali ${nomorPeninjauanKembali} berhasil disimpan`);
        } catch (error: any) {
            showAlert("error", error.message || "Gagal menyimpan nomor peninjauan kembali");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (row: any) => {
        setSelectedId(row.id);

    };

    return (
        <div className="justify-center">
            {/* Input Nomor PeninjauanKembali */}
            <form onSubmit={handleSubmit}>
                <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium mb-2">Nomor PeninjauanKembali</label>
                    <InputText
                        value={nomorPeninjauanKembali}
                        onChange={(e) => setNomorPeninjauanKembali(e.target.value)}
                        placeholder="Isi nomor peninjauan kembali"
                        className="w-full"
                    />
                </div>

                <Button
                    type="submit"
                    label={isLoading ? "Menyimpan..." : "Simpan"}
                    disabled={isLoading}
                    severity="success"
                />
            </form>

            {/* Tabel Data */}
            <h2 className="text-2xl font-semibold text-black my-4 col-span-2">Daftar Perkara</h2>

            <div className="w-full">
                <DataTable
                    isLoading={isLoadingPeninjauanKembali}
                    data={dataPeninjauanKembali}
                    columns={[
                        { header: "No", accessor: "no" },
                        { header: "Nomor Perkara", accessor: "nomor_perkara" },
                        { header: "Pihak", accessor: "pihak" },
                        { header: "Panitra Pengganti", accessor: "panitra_pengganti" },
                        {
                            header: "Penanggung Jawab",
                            accessor: "penanggung_jawabs",
                            render: (value) =>
                                value?.map((pj: any) => pj.nama).join(", ") || "-",
                        },
                        {
                            header: "Dibuat Oleh",
                            accessor: "CreatedByUser.name",
                            render: (_: any, row: any) => row.CreatedByUser?.name || "-",
                        },
                        {
                            header: "Diubah Oleh",
                            accessor: "UpdatedByUser.name",
                            render: (_: any, row: any) => row.UpdatedByUser?.name || "-",
                        },
                        {
                            header: "Actions",
                            accessor: "id",
                            render: (_: any, row: any) => (
                                <div className="flex gap-2">
                                    <Button
                                        label="Pilih"
                                        rounded
                                        size="small"
                                        onClick={() => handleSelect(row)}
                                        className={
                                            row.id === selectedId
                                                ? "!bg-orange-500 !text-white !hover:bg-orange-600"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }
                                    />

                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
