"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { UploadCloud } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useAlert } from "@/context/AlertContext";
import { findOne, updateTahapBanding } from "./api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

type Step = { label: string; content: React.ReactNode };
type FileFieldKey = "aktaFile" | "memoriFile" | "kontraFile" | "putusanFile";

type MultiFileState = {
    id?: number;
    file: File | null;
    deskripsi: string;
    existing?: string;
}[];

export default function StepperBanding() {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const params = useParams();
    const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/uploads";

    const [formData, setFormData] = useState({
        nomor_banding: "",
        aktaFile: [] as MultiFileState,
        memoriFile: [] as MultiFileState,
        kontraFile: [] as MultiFileState,
        putusanFile: [] as MultiFileState,
        keputusan: "",
    });

    const { data: dataBanding, mutate } = findOne(Number(params.id));

    /** 🟢 PILIH FILE MULTIPLE */
    const handleFileSelect = (e: any, field: FileFieldKey) => {
        const files: FileList | undefined = e.target?.files;
        if (!files || files.length === 0) return;
        const arr = Array.from(files).map((f) => ({ file: f, deskripsi: "" }));
        setFormData((prev) => ({
            ...prev,
            [field]: [...(prev[field] as MultiFileState), ...arr],
        }));
    };

    /** 🟢 SIMPAN KE SERVER */
    const handleUpdate = async () => {
        const form = new FormData();
        form.append("nomor_banding", formData.nomor_banding);

        // helper untuk setiap kategori file
        const appendFiles = (key: FileFieldKey, tipe: string) => {
            const list = formData[key] as MultiFileState;
            list.forEach((item) => {
                if (item.file) {
                    form.append("files", item.file);
                    form.append("file_tipes", tipe);
                    form.append("file_deskripsis", item.deskripsi || "");

                }
            });
        };

        appendFiles("aktaFile", "AKTA");
        appendFiles("memoriFile", "MEMORI");
        appendFiles("kontraFile", "KONTRA");
        appendFiles("putusanFile", "PUTUSAN");
        form.append("keputusan", formData.keputusan);
        console.log(formData," formdata");

        try {
            await updateTahapBanding(Number(params.id), form);
            showAlert("success", "Data banding berhasil diperbarui ✅");
            mutate();
        } catch (err: any) {
            console.error(err);
            showAlert("error", err.message || "Gagal memperbarui banding");
        }
    };

    /** 🟢 TAMPILKAN FILE */
    const renderMultiPreview = (
        list: MultiFileState,
        label: string,
        fieldKey: FileFieldKey,
        tipe: string
    ) => {
        if (!list || list.length === 0) return null;
        return (
            <div className="mt-4 space-y-3">
                {list.map((item, idx) => {
                    const url = item.file
                        ? URL.createObjectURL(item.file)
                        : item.existing
                            ? `${API_BASE}/${item.existing}`
                            : null;

                    return (
                        <div key={`${fieldKey}-${idx}`} className="border rounded bg-white p-3 shadow-sm">
                            <ConfirmDialog />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <i
                                        className={`pi ${item.file
                                            ? "pi-cloud-upload text-green-500"
                                            : "pi-file text-blue-500"
                                            }`}
                                    />
                                    <span className="text-sm font-medium">
                                        {item.file?.name || item.existing || `${label} #${idx + 1}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {url && (
                                        <Button
                                            type="button"
                                            label="Lihat"
                                            icon="pi pi-external-link"
                                            onClick={() => window.open(url, "_blank")}
                                            className="p-button-outlined p-button-sm"
                                        />
                                    )}
                                    <Button
                                        type="button"
                                        icon="pi pi-trash"
                                        className="p-button-text p-button-danger p-button-sm"
                                        onClick={() =>
                                            confirmDialog({
                                                message: "Apakah Anda yakin ingin menghapus file ini?",
                                                header: "Konfirmasi Hapus",
                                                icon: "pi pi-exclamation-triangle",
                                                acceptClassName: "p-button-danger",
                                                acceptLabel: "Ya, Hapus",
                                                rejectLabel: "Batal",
                                                accept: async () => {
                                                    const fileId = item.id;
                                                    try {
                                                        if (fileId) {
                                                            const res = await fetch(
                                                                `${process.env.NEXT_PUBLIC_API_URL}/banding-file/${fileId}`,
                                                                { method: "DELETE" }
                                                            );
                                                            if (!res.ok)
                                                                throw new Error("Gagal menghapus file di server");
                                                        }
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            [fieldKey]: (
                                                                prev[fieldKey] as MultiFileState
                                                            ).filter((_, i) => i !== idx),
                                                        }));
                                                    } catch (err) {
                                                        console.error(err);
                                                        showAlert("error", "Gagal menghapus file ❌");
                                                    }
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="mt-2">
                                <label className="block text-xs text-gray-600 mb-1">
                                    Deskripsi {label} #{idx + 1}
                                </label>
                                <InputTextarea
                                    rows={2}
                                    value={item.deskripsi}
                                    onChange={(e) =>
                                        setFormData((prev) => {
                                            const clone = [...(prev[fieldKey] as MultiFileState)];
                                            clone[idx] = { ...clone[idx], deskripsi: e.target.value };
                                            return { ...prev, [fieldKey]: clone };
                                        })
                                    }
                                    className="w-full"
                                    placeholder="Tuliskan deskripsi file ini..."
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    /** 🟢 MAP API -> STATE */
    useEffect(() => {
        if (!dataBanding) return;

        const mapFiles = (
            files?: { id: number; path: string; deskripsi?: string; tipe?: string }[],
            tipe?: string
        ): MultiFileState => {
            if (!files) return [];
            return files
                .filter((f) => f.tipe === tipe)
                .map((f) => ({
                    id: f.id,
                    file: null,
                    existing: f.path,
                    deskripsi: f.deskripsi || "",
                }));
        };

        setFormData({
            nomor_banding: dataBanding.nomor_banding || "",
            aktaFile: mapFiles(dataBanding.files, "AKTA"),
            memoriFile: mapFiles(dataBanding.files, "MEMORI"),
            kontraFile: mapFiles(dataBanding.files, "KONTRA"),
            putusanFile: mapFiles(dataBanding.files, "PUTUSAN"),
            keputusan: dataBanding.keputusan || "",
        });
    }, [dataBanding]);

    /** 🟢 TEMPLATE STEP */
    const renderStep = (
        field: FileFieldKey,
        label: string,
        tipe: string,
        current: number,
        next: number | null
    ) => (
        <div>
            <h2 className="text-lg font-bold mb-2">📑 {label}</h2>
            <p className="text-gray-600 mb-6">
                Unggah dokumen {label.toLowerCase()} di sini.
            </p>

            <input
                type="file"
                id={field}
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, field)}
            />
            <label
                htmlFor={field}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
            >
                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                <p className="font-medium">Upload {label}</p>
                <p className="text-sm">Klik atau drag & drop (bisa banyak file)</p>
            </label>

            {renderMultiPreview(formData[field] as MultiFileState, label, field, tipe)}

            <div className="flex justify-between mt-10">
                <Button
                    label="Kembali"
                    className="p-button-secondary"
                    onClick={() => setCurrentStep(Math.max(1, current - 1))}
                />
                <div className="flex justify-end gap-4">
                    <Button
                        label="Simpan"
                        className="p-button-success"
                        onClick={() => handleUpdate()}
                    />
                    {next && (
                        <Button
                            label="Selanjutnya"
                            className="p-button-warning"
                            onClick={() => setCurrentStep(next)}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    /** 🟢 STEP DEFINITIONS */
    const steps: Step[] = [
        { label: "Akta Banding", content: renderStep("aktaFile", "Akta Banding", "AKTA", 1, 2) },
        { label: "Memori Banding", content: renderStep("memoriFile", "Memori Banding", "MEMORI", 2, 3) },
        { label: "Kontra Memori", content: renderStep("kontraFile", "Kontra Memori", "KONTRA", 3, 4) },
        {
            label: "Putusan Banding",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Banding</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen putusan banding di sini.</p>

                    <input
                        type="file"
                        id="putusanFile"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "putusanFile")}
                    />
                    <label
                        htmlFor="putusanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Banding</p>
                        <p className="text-sm">Klik atau drag & drop (bisa banyak file)</p>
                    </label>

                    {renderMultiPreview(formData.putusanFile, "Putusan Banding", "putusanFile", "PUTUSAN")}

                    {/* ✅ Tambahkan Dropdown Keputusan di sini */}
                    <div className="mt-6">
                        <label className="font-medium text-gray-700 mb-2 block">
                            Keputusan
                        </label>
                        <Dropdown
                            value={formData.keputusan}
                            options={[
                                { label: "Menang", value: "menang" },
                                { label: "Kalah", value: "kalah" },
                            ]}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, keputusan: e.value }))
                            }
                            placeholder="Pilih Keputusan"
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-10">
                        <Button
                            label="Simpan"
                            className="p-button-success"
                            onClick={() => handleUpdate()}
                        />
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                    </div>
                </div>
            ),
        }

    ];

    return (
        <div className="p-6 bg-[#FFFCF0] min-h-screen rounded-xl">
            <h1 className="text-2xl font-bold mb-8 text-center">Tahapan Banding</h1>

            <Stepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />

            <div className="relative w-full h-1 bg-gray-200 rounded my-6">
                <div
                    className="absolute top-0 left-0 h-1 bg-[#0B5C4D] rounded transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
            </div>

            <div>{steps[currentStep - 1].content}</div>
        </div>
    );
}
