"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { UploadCloud } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { useAlert } from "@/context/AlertContext";
import { findOne, update, updateTahapBanding } from "./api";

type Step = {
    label: string;
    content: React.ReactNode;
};

type FileState = {
    file: File | null;
    deskripsi: string;
    existing?: string;
} | null;

export default function StepperBanding() {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const params = useParams();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/uploads";

    // Modal Upload File
    const [showUploadModal, setShowUploadModal] = useState<
        null | "aktaFile" | "memoriFile" | "kontraFile" | "putusanFile"
    >(null);

    const [fileTemp, setFileTemp] = useState<File | null>(null);
    const [fileDesc, setFileDesc] = useState("");

    const [formData, setFormData] = useState({
        nomor_banding: "",
        aktaFile: null as FileState,
        memoriFile: null as FileState,
        kontraFile: null as FileState,
        putusanFile: null as FileState,
    });

    // get data banding
    const { data: dataBanding, isLoading, mutate } = findOne(Number(params.id));
    console.log(dataBanding, "dataBanding");

    const handleFileSelect = (
        e: any,
        field: "aktaFile" | "memoriFile" | "kontraFile" | "putusanFile"
    ) => {
        let file: File | null = null;
        if (e.target?.files) file = e.target.files[0];
        if (e.files) file = e.files[0];
        if (file) {
            setFileTemp(file);
            setFileDesc("");
            setShowUploadModal(field);
        }
    };

    const handleUpdate = async () => {
        const form = new FormData();
        form.append("nomor_banding", formData.nomor_banding);

        const appendFile = (key: keyof typeof formData, field: string) => {
            const data = formData[key] as FileState;
            if (data?.file) form.append(field, data.file);
            if (data?.deskripsi) form.append(`${field}_desc`, data.deskripsi);
        };

        appendFile("aktaFile", "akta_banding");
        appendFile("memoriFile", "memori_banding");
        appendFile("kontraFile", "kontra_memori");
        appendFile("putusanFile", "putusan_banding");

        try {
            await updateTahapBanding(Number(params.id), form);
            showAlert("success", "Data banding berhasil diperbarui ✅");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal memperbarui banding");
        }
    };

    const renderFilePreview = (field: keyof typeof formData, label: string, fieldName: string) => {
        const data = formData[field] as FileState;
        if (!data) return null;

        return (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                {data.file ? (
                    <div className="flex items-center space-x-2 mb-2 p-2 bg-white rounded">
                        <i className="pi pi-cloud-upload text-green-500"></i>
                        <div>
                            <p className="text-xs text-gray-500">File Baru</p>
                            <p className="text-sm font-semibold">{data.file.name}</p>
                        </div>
                    </div>
                ) : data.existing ? (
                    <div className="flex items-center justify-between mb-2 p-2 bg-white rounded">
                        <div className="flex items-center space-x-2">
                            <i className="pi pi-file text-blue-500"></i>
                            <span className="text-sm">{label} tersedia</span>
                        </div>
                        <Button
                            type="button"
                            label="Lihat"
                            icon="pi pi-external-link"
                            onClick={() => window.open(`${API_BASE}/${data.existing}`, "_blank")}
                            className="p-button-outlined p-button-sm"
                        />
                    </div>
                ) : null}

                <div className="text-lg text-gray-600 p-2 bg-white rounded">
                    <span className="font-medium">Deskripsi:</span> {data.deskripsi || "-"}
                </div>
            </div>
        );
    };

    // mapping API → state
    useEffect(() => {
        if (!dataBanding) return;
        const mapFile = (field: string, desc: string) =>
            field
                ? {
                    file: null,
                    deskripsi: desc || "",
                    existing: field,
                }
                : null;

        setFormData((prev) => ({
            ...prev,
            nomor_banding: dataBanding.nomor_banding || "",
            aktaFile: mapFile(dataBanding.akta_banding, dataBanding.akta_banding_desc),
            memoriFile: mapFile(dataBanding.memori_banding, dataBanding.memori_banding_desc),
            kontraFile: mapFile(dataBanding.kontra_memori, dataBanding.kontra_memori_desc),
            putusanFile: mapFile(dataBanding.putusan_banding, dataBanding.putusan_banding_desc),
        }));
    }, [dataBanding]);

    const steps: Step[] = [
        {
            label: "Akta Banding",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Akta Banding</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen akta banding di sini.</p>

                    <input type="file" id="aktaFile" className="hidden" onChange={(e) => handleFileSelect(e, "aktaFile")} />
                    <label
                        htmlFor="aktaFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Akta Banding</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("aktaFile", "Akta Banding", "akta_banding")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="flex justify-end gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(2)} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            label: "Memori Banding",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Memori Banding</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen memori banding di sini.</p>

                    <input type="file" id="memoriFile" className="hidden" onChange={(e) => handleFileSelect(e, "memoriFile")} />
                    <label
                        htmlFor="memoriFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Memori Banding</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("memoriFile", "Memori Banding", "memori_banding")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="flex justify-end gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(3)} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            label: "Kontra Memori",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Kontra Memori Banding</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen kontra memori di sini.</p>

                    <input type="file" id="kontraFile" className="hidden" onChange={(e) => handleFileSelect(e, "kontraFile")} />
                    <label
                        htmlFor="kontraFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Kontra Memori</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("kontraFile", "Kontra Memori", "kontra_memori")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(2)} />
                        <div className="flex justify-end gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(4)} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            label: "Putusan Banding",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Banding</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen putusan banding di sini.</p>

                    <input type="file" id="putusanFile" className="hidden" onChange={(e) => handleFileSelect(e, "putusanFile")} />
                    <label
                        htmlFor="putusanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D]"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Banding</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("putusanFile", "Putusan Banding", "putusan_banding")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(3)} />
                        <div className="flex justify-end gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                        </div>
                    </div>
                </div>
            ),
        },
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

            {/* Modal Upload Deskripsi */}
            <Dialog
                header="Tambah Deskripsi File"
                visible={showUploadModal !== null}
                style={{ width: "30rem" }}
                modal
                onHide={() => setShowUploadModal(null)}
            >
                <div className="flex flex-col gap-3">
                    {fileTemp && (
                        <p className="text-sm text-gray-700">
                            File: <span className="font-semibold">{fileTemp.name}</span>
                        </p>
                    )}
                    <label className="font-medium">Deskripsi</label>
                    <InputTextarea
                        value={fileDesc}
                        onChange={(e) => setFileDesc(e.target.value)}
                        rows={3}
                        placeholder="Tuliskan deskripsi file..."
                        className="w-full"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button label="Batal" className="p-button-text" onClick={() => setShowUploadModal(null)} />
                        <Button
                            label="Simpan"
                            onClick={() => {
                                if (!fileTemp) return;
                                setFormData((prev) => ({
                                    ...prev,
                                    [showUploadModal!]: { file: fileTemp, deskripsi: fileDesc },
                                }));
                                setShowUploadModal(null);
                                setFileTemp(null);
                                setFileDesc("");
                            }}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
