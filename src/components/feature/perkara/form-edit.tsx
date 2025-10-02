"use client";

import { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";

import { findOne, update } from "./api";
import { useAlert } from "@/context/AlertContext";
import { useParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PerkaraFormEdit() {
    const { showAlert } = useAlert();
    const router = useRouter();
    const param = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        surat_permohonan: null as File | null | string,
        hari: "",
        tanggal: null as Date | null,
        ruang_sidang: "",
        agenda: "",
        penggugat: "",
        tergugat: "",
        nomor_perkara: "",
        tanggal_perkara: null as Date | null,
        gugatan: "",
        panitra_pengganti: "",
        pihak: "",
        penanggung_jawab: [] as string[], // ⬅️ array

    });

    // fetch data lama
    const { data, isLoading: isLoadingData } = findOne(Number(param.id));
    console.log(data, "data");
    useEffect(() => {
        if (!data) return;
        const perkara = data;
        setForm({
            surat_permohonan: perkara.surat_permohonan ?? null,
            hari: perkara.hari ?? "",
            tanggal: perkara.tanggal ? new Date(perkara.tanggal) : null,
            ruang_sidang: perkara.ruang_sidang ?? "",
            agenda: perkara.agenda ?? "",
            penggugat: perkara.penggugat ?? "",
            tergugat: perkara.tergugat ?? "",
            nomor_perkara: perkara.nomor_perkara ?? "",
            tanggal_perkara: perkara.tanggal_perkara
                ? new Date(perkara.tanggal_perkara)
                : null,
            gugatan: perkara.gugatan ?? "",
            panitra_pengganti: perkara.panitra_pengganti ?? "",
            pihak: perkara.pihak ?? "",
            penanggung_jawab: perkara.penanggung_jawabs.map((pj: any) => pj.nama),

        });
    }, [data]);
    console.log(form, "form");
    // url file lama dari server
    const existingFileUrl = useMemo(() => {
        if (typeof form.surat_permohonan === "string" && form.surat_permohonan) {
            return `${API_BASE}/uploads/${form.surat_permohonan}`;
        }
        return null;
    }, [form.surat_permohonan]);

    // preview file baru (blob url)
    const newFilePreviewUrl = useMemo(() => {
        if (form.surat_permohonan instanceof File) {
            return URL.createObjectURL(form.surat_permohonan);
        }
        return null;
    }, [form.surat_permohonan]);

    const handleFileSelect = (e: FileUploadSelectEvent) => {
        if (e.files && e.files.length > 0) {
            setForm((prev) => ({ ...prev, surat_permohonan: e.files[0] }));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (value === null || value === undefined) return;

                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                }
                else if (key === "surat_permohonan") {
                    if (value instanceof File) {
                        formData.append("surat_permohonan", value);
                    }
                }
                else if (Array.isArray(value)) {
                    value.forEach((v) => {
                        formData.append(`${key}[]`, v); // kirim sebagai array
                    });
                }
                else {
                    formData.append(key, value as any);
                }
            });

            await update(Number(param.id), formData);
            showAlert("success", "Perkara berhasil diperbarui ✅");
            router.push("/admin/perkara");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal update perkara");
        } finally {
            setIsSubmitting(false);
            if (newFilePreviewUrl) URL.revokeObjectURL(newFilePreviewUrl);
        }
    };


    return (
        <div className="flex justify-center">
            <Card className="w-full">
                <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                    {/* ==== Upload & Preview Surat Permohonan ==== */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Upload Surat Permohonan
                        </label>
                        {isLoadingData ? (
                            <Skeleton height="2.5rem" className="w-full" />
                        ) : (
                            <>
                                <FileUpload
                                    mode="basic"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    chooseLabel="Pilih File"
                                    className="w-full"
                                    customUpload
                                    auto={false}
                                    onSelect={handleFileSelect}
                                />

                                {/* Tombol lihat file */}
                                {newFilePreviewUrl ? (
                                    <div className="mt-3">
                                        <Button
                                            type="button"
                                            label="Lihat File Baru"
                                            icon="pi pi-external-link"
                                            onClick={() => window.open(newFilePreviewUrl, "_blank")}
                                            className="p-button-outlined p-button-sm"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">
                                            {(form.surat_permohonan as File).name}
                                        </p>
                                    </div>
                                ) : existingFileUrl ? (
                                    <div className="mt-3">
                                        <Button
                                            type="button"
                                            label="Lihat File Saat Ini"
                                            icon="pi pi-external-link"
                                            onClick={() => window.open(existingFileUrl!, "_blank")}
                                            className="p-button-outlined p-button-sm"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">
                                            {String(form.surat_permohonan)}
                                        </p>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>

                    {/* ==== Hari ==== */}
                    <InputWrapper
                        label="Hari"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.hari}
                                onChange={(e) => setForm({ ...form, hari: e.target.value })}
                                placeholder="Contoh: Senin"
                                className="w-full"
                            />
                        }
                    />

                    {/* ==== Tanggal ==== */}
                    <InputWrapper
                        label="Tanggal"
                        loading={isLoadingData}
                        children={
                            <Calendar
                                value={form.tanggal}
                                onChange={(e) =>
                                    setForm({ ...form, tanggal: e.value as Date | null })
                                }
                                className="w-full"
                                dateFormat="dd-mm-yy"
                                showIcon
                            />
                        }
                    />

                    {/* Ruang Sidang */}
                    <InputWrapper
                        label="Ruang Sidang"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.ruang_sidang}
                                onChange={(e) =>
                                    setForm({ ...form, ruang_sidang: e.target.value })
                                }
                                placeholder="Ruang 1 / Ruang Cakra"
                                className="w-full"
                            />
                        }
                    />

                    {/* Agenda */}
                    <InputWrapper
                        label="Agenda"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.agenda}
                                onChange={(e) =>
                                    setForm({ ...form, agenda: e.target.value })
                                }
                                placeholder="Agenda Sidang"
                                className="w-full"
                            />
                        }
                    />

                    {/* Penggugat */}
                    <InputWrapper
                        label="Penggugat"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.penggugat}
                                onChange={(e) =>
                                    setForm({ ...form, penggugat: e.target.value })
                                }
                                placeholder="Nama Penggugat"
                                className="w-full"
                            />
                        }
                    />

                    {/* Tergugat */}
                    <InputWrapper
                        label="Tergugat"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.tergugat}
                                onChange={(e) =>
                                    setForm({ ...form, tergugat: e.target.value })
                                }
                                placeholder="Nama Tergugat"
                                className="w-full"
                            />
                        }
                    />

                    {/* Nomor Perkara */}
                    <InputWrapper
                        label="Nomor Perkara"
                        loading={isLoadingData}
                        children={
                            <InputText
                                value={form.nomor_perkara}
                                onChange={(e) =>
                                    setForm({ ...form, nomor_perkara: e.target.value })
                                }
                                placeholder="123/Pdt.G/2025/PN.Mdn"
                                className="w-full"
                            />
                        }
                    />

                    {/* Tanggal Perkara */}
                    <InputWrapper
                        label="Tanggal Perkara"
                        loading={isLoadingData}
                        children={
                            <Calendar
                                value={form.tanggal_perkara}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        tanggal_perkara: e.value as Date | null,
                                    })
                                }
                                className="w-full"
                                dateFormat="dd-mm-yy"
                                showIcon
                            />
                        }
                    />

                    {/* Gugatan */}
                    <InputWrapper
                        label="Gugatan"
                        loading={isLoadingData}
                        children={
                            <Dropdown
                                value={form.gugatan}
                                options={[
                                    { label: "Gugatan PMH", value: "Gugatan PMH" },
                                    { label: "Gugatan Wanprestasi", value: "Gugatan Wanprestasi" },
                                ]}
                                onChange={(e) => setForm({ ...form, gugatan: e.value })}
                                placeholder="Pilih Gugatan"
                                className="w-full"
                            />
                        }
                    />

                    {/* Pihak */}
                    <InputWrapper
                        label="Pihak"
                        loading={isLoadingData}
                        children={
                            <InputTextarea
                                value={form.pihak}
                                onChange={(e) => setForm({ ...form, pihak: e.target.value })}
                                rows={4}
                                placeholder="Isi pihak..."
                                className="w-full"
                            />
                        }
                    />

                    {/* Panitra Pengganti */}
                    <InputWrapper
                        label="Panitra Pengganti"
                        loading={isLoadingData}
                        children={
                            <InputTextarea
                                value={form.panitra_pengganti}
                                onChange={(e) =>
                                    setForm({ ...form, panitra_pengganti: e.target.value })
                                }
                                rows={4}
                                placeholder="Isi panitra pengganti..."
                                className="w-full"
                            />
                        }

                    />

                    <div>
                        <label className="block text-sm font-medium mb-2">Penanggung Jawab</label>

                        {form.penanggung_jawab.map((pj, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <InputText
                                    value={pj}
                                    onChange={(e) => {
                                        const newPj = [...form.penanggung_jawab];
                                        newPj[index] = e.target.value;
                                        setForm({ ...form, penanggung_jawab: newPj });
                                    }}
                                    placeholder={`Penanggung Jawab ${index + 1}`}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-trash"
                                    type="button"
                                    className="p-button-danger p-button-text"
                                    onClick={() => {
                                        const newPj = form.penanggung_jawab.filter((_, i) => i !== index);
                                        setForm({ ...form, penanggung_jawab: newPj });
                                    }}
                                />
                            </div>
                        ))}

                        <Button
                            label="Tambah Penanggung Jawab"
                            type="button"
                            icon="pi pi-plus"
                            className="p-button-sm p-button-outlined"
                            onClick={() =>
                                setForm({ ...form, penanggung_jawab: [...form.penanggung_jawab, ""] })
                            }
                        />
                    </div>



                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            label={isSubmitting ? "Mengupdate..." : "Update Perkara"}
                            icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-save"}
                            disabled={isSubmitting}
                            className="p-button-warning"
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
}

/* ==== Komponen Wrapper untuk Skeleton ==== */
function InputWrapper({
    label,
    loading,
    children,
}: {
    label: string;
    loading: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">{label}</label>
            {loading ? <Skeleton height="2.5rem" className="w-full" /> : children}
        </div>
    );
}
