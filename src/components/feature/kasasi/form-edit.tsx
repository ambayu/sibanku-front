"use client";

import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import DataTable from "@/components/ui/DataTable";
import { RealfindAll } from "../perkara/api";
import { useAlert } from "@/context/AlertContext";
import { create, findOne, update } from "./api";
import { useParams } from "next/navigation";
import { Skeleton } from "primereact/skeleton";
import { findAll } from "../banding/api";

export default function KasasiFormEdit() {
    const { showAlert } = useAlert();
    const { data: dataPerkara, isLoading: isLoadingPerkara } = findAll(1, 10000);
    const param = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [nomorKasasi, setNomorKasasi] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data: dataKasasi, isLoading: isLoadingKasasi, mutate } = findOne(Number(param.id));

    console.log(dataKasasi, "dataKasasi");
    useEffect(() => {
        if (dataKasasi) {
            setNomorKasasi(dataKasasi.nomor_kasasi);
            setSelectedId(dataKasasi.id_perkara);
        }
    }, [dataKasasi]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            nomor_kasasi: nomorKasasi,
            id_banding: selectedId
        }

        try {
            await update(Number(param.id), payload);
            showAlert("success", `Nomor kasasi ${nomorKasasi} berhasil disimpan`);
        } catch (error: any) {
            showAlert("error", error.message || "Gagal menyimpan nomor kasasi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (row: any) => {
        setSelectedId(row.id || null);

    };

    return (
        <div className="justify-center">
            {/* Input Nomor Kasasi */}
            <form onSubmit={handleSubmit}>
                <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium mb-2">Nomor Kasasi</label>
                    {isLoadingKasasi ? <Skeleton height="2.5rem" className="w-full" /> : <InputText

                        value={nomorKasasi}
                        onChange={(e) => setNomorKasasi(e.target.value)}
                        placeholder="Isi nomor kasasi"
                        className="w-full"
                    />}
                </div>

                <Button
                    type="submit"
                    label={isLoading ? "Menyimpan..." : "Simpan"}
                    disabled={isLoading}
                    severity="success"
                />
            </form>

            {/* Tabel Data */}
            <h2 className="text-2xl font-semibold my-4 col-span-2">Daftar Kasasi</h2>

            <div className="w-full">
                <DataTable
                    isLoading={isLoadingPerkara}
                    data={dataPerkara}
                    columns={[
                        { header: "No", accessor: "no" },
                        { header: "Nomor Perkara", accessor: "nomor_perkara", render: (_: any, row: any) => row.perkara?.nomor_perkara || "-" },
                        { header: "Nomor Banding", accessor: "nomor_banding", },
                        { header: "Pihak", accessor: "pihak", render: (_: any, row: any) => row.perkara?.pihak || "-" },
                        { header: "Panitra Pengganti", accessor: "panitra_pengganti", render: (_: any, row: any) => row.perkara?.panitra_pengganti || "-" },
                        {
                            header: "Penanggung Jawab",
                            accessor: "penanggung_jawabs",
                            render: (_: any, row: any) => row.perkara?.penanggung_jawabs.map((pj: any) => pj.nama).join(", ")
                        },
                        {
                            header: "Dibuat Oleh",
                            accessor: "CreatedByUser.name",
                            render: (_: any, row: any) => row.createdByUser?.name || "-",
                        },
                        {
                            header: "Diubah Oleh",
                            accessor: "UpdatedByUser.name",
                            render: (_: any, row: any) => row.updatedByUser?.name || "-",
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
