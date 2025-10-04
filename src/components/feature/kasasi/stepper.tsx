"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { UploadCloud } from "lucide-react";
import { findOne, tahapPerkara } from "./api";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { useAlert } from "@/context/AlertContext";
import { Dropdown } from "primereact/dropdown";

type Step = {
    label: string;
    content: React.ReactNode;
};
type FileState = {
    file: File | null;
    deskripsi: string;
    existing?: string; // dari API
} | null;

export default function StepperPerkara() {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const params = useParams();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/uploads";

    // Modal Catatan Sidang
    const [showModal, setShowModal] = useState<"pihak" | "mediasi" | null>(null);

    // Modal Upload File
    const [showUploadModal, setShowUploadModal] = useState<
        null | "resumeFile" | "skkFile" | "sptFile" | "jawabanFile" | "replikFile" | "duplikFile" | "putusan_selaFile" | "putusan_majelisFile" | "kesimpulanFile"
    >(null);
    const [formData, setFormData] = useState({
        resumeFile: null as FileState,
        skkFile: null as FileState,
        sptFile: null as FileState,
        jawabanFile: null as FileState,
        replikFile: null as FileState,
        duplikFile: null as FileState,
        putusan_selaFile: null as FileState,
        putusan_majelisFile: null as FileState,
        kesimpulanFile: null as FileState,
        keputusan: "",
        menghadirkan_pihak: [] as {
            tanggal: Date | null;
            para_pihak: string;
            kedudukan: string;
            keterangan: string;
        }[],
        mediasi: [] as {
            tanggal: Date | null;
            para_pihak: string;
            kedudukan: string;
            keterangan: string;
        }[],
    });

    const [fileTemp, setFileTemp] = useState<File | null>(null);
    const [fileDesc, setFileDesc] = useState("");

    const [formCatatan, setFormCatatan] = useState({
        tanggal: null as Date | null,
        para_pihak: "",
        kedudukan: "",
        keterangan: "",
    });

    function formatTanggal(dateString?: string | null) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(date);
    }

    const handleTambahCatatan = () => {
        if (!formCatatan.tanggal || !formCatatan.para_pihak || !formCatatan.kedudukan) {
            showAlert("error", "Semua field harus diisi");
            return;
        }

        setFormData((prev) => {
            if (showModal === "pihak") {
                return { ...prev, menghadirkan_pihak: [...prev.menghadirkan_pihak, { ...formCatatan }] };
            }
            if (showModal === "mediasi") {
                return { ...prev, mediasi: [...prev.mediasi, { ...formCatatan }] };
            }
            return prev;
        });

        setFormCatatan({ tanggal: null, para_pihak: "", kedudukan: "", keterangan: "" });
        setShowModal(null);
    };

    // Upload File → Simpan ke state sementara + buka modal
    const handleFileSelect = (
        e: any,
        field:
            | "resumeFile"
            | "skkFile"
            | "sptFile"
            | "jawabanFile"
            | "replikFile"
            | "duplikFile"
            | "putusan_selaFile"
            | "putusan_majelisFile"
            | "kesimpulanFile"
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
    const { data: dataPerkara, isLoading } = findOne(Number(params.id));

    const handleUpdate = async () => {
        const form = new FormData();

        // iterate dokumen
        const appendFile = (key: keyof typeof formData, fieldName: string) => {
            const data = formData[key] as FileState;
            if (data?.file) form.append(fieldName, data.file);
            if (data?.deskripsi) form.append(`${fieldName}_desc`, data.deskripsi);
        };

        appendFile("resumeFile", "resume");
        appendFile("skkFile", "skk");
        appendFile("sptFile", "spt");
        appendFile("jawabanFile", "jawaban");
        appendFile("replikFile", "replik");
        appendFile("duplikFile", "duplik");
        appendFile("putusan_selaFile", "putusan_sela");
        appendFile("putusan_majelisFile", "putusan_majelis");
        appendFile("kesimpulanFile", "kesimpulan");
        if (formData.keputusan) form.append("keputusan", formData.keputusan);

        // 🔹 serialize catatan
        if (formData.menghadirkan_pihak.length > 0) {
            form.append("catatan_pihak", JSON.stringify(formData.menghadirkan_pihak));
        }
        if (formData.mediasi.length > 0) {
            form.append("catatan_mediasi", JSON.stringify(formData.mediasi));
        }

        try {
            await tahapPerkara(Number(params.id), form);
            showAlert("success", "Perkara berhasil diperbarui ✅");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal update perkara");
        }
    };

    const renderFilePreview = (
        field: keyof typeof formData,
        label: string,
        fieldName: string
    ) => {
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
                            onClick={() =>
                                window.open(
                                    `${API_BASE}/${data.existing}`,
                                    "_blank"
                                )
                            }
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
        if (!dataPerkara) return;

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
            resumeFile: mapFile(dataPerkara.resume, dataPerkara.resume_desc),
            skkFile: mapFile(dataPerkara.skk, dataPerkara.skk_desc),
            sptFile: mapFile(dataPerkara.spt, dataPerkara.spt_desc),
            jawabanFile: mapFile(dataPerkara.jawaban, dataPerkara.jawaban_desc),
            replikFile: mapFile(dataPerkara.replik, dataPerkara.replik_desc),
            duplikFile: mapFile(dataPerkara.duplik, dataPerkara.duplik_desc),
            putusan_selaFile: mapFile(
                dataPerkara.putusan_sela,
                dataPerkara.putusan_sela_desc
            ),
            putusan_majelisFile: mapFile(
                dataPerkara.putusan_majelis,
                dataPerkara.putusan_majelis_desc
            ),
            kesimpulanFile: mapFile(
                dataPerkara.kesimpulan,
                dataPerkara.kesimpulan_desc
            ),
            keputusan: dataPerkara.keputusan || "",
            menghadirkan_pihak:
                dataPerkara.catatan_pihak?.map((c: any) => ({
                    tanggal: c.tanggal ? new Date(c.tanggal) : null,
                    para_pihak: c.para_pihak,
                    kedudukan: c.kedudukan,
                    keterangan: c.keterangan,
                })) || [],
            mediasi:
                dataPerkara.catatan_mediasi?.map((c: any) => ({
                    tanggal: c.tanggal ? new Date(c.tanggal) : null,
                    para_pihak: c.para_pihak,
                    kedudukan: c.kedudukan,
                    keterangan: c.keterangan,
                })) || [],
        }));
    }, [dataPerkara]);
    console.log(dataPerkara, "data perkara");

    // Stepper
    const steps: Step[] = [
        {
            label: "Dokumen Awal",
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-4">📄 Dokumen Awal</h2>
                    <p className="text-gray-600 mb-6">Detail informasi dari dokumen awal perkara</p>

                    {isLoading ? (
                        <Skeleton width="100%" height="10rem" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 rounded-lg bg-white shadow-sm ">
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900 w-1/3">Nomor Perkara</td>
                                        <td className="px-4 py-2">{dataPerkara?.nomor_perkara || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Hari</td>
                                        <td className="px-4 py-2">{dataPerkara?.hari || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Tanggal</td>
                                        <td className="px-4 py-2">{formatTanggal(dataPerkara?.tanggal) || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Ruang Sidang</td>
                                        <td className="px-4 py-2">{dataPerkara?.ruang_sidang || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Agenda</td>
                                        <td className="px-4 py-2">{dataPerkara?.agenda || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Penggugat</td>
                                        <td className="px-4 py-2">{dataPerkara?.penggugat || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Tergugat</td>
                                        <td className="px-4 py-2">{dataPerkara?.tergugat || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Tanggal Perkara</td>
                                        <td className="px-4 py-2">{formatTanggal(dataPerkara?.tanggal_perkara) || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Jenis Gugatan</td>
                                        <td className="px-4 py-2">{dataPerkara?.gugatan || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Pihak</td>
                                        <td className="px-4 py-2 whitespace-pre-line">{dataPerkara?.pihak || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Panitra Pengganti</td>
                                        <td className="px-4 py-2">{dataPerkara?.panitra_pengganti || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Penanggung Jawab</td>
                                        <td className="px-4 py-2">{dataPerkara?.penanggung_jawabs.map((pj: any) => pj.nama).join(", ") || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {dataPerkara?.surat_permohonan && (
                                <div className="mt-4">
                                    <Button
                                        type="button"
                                        label="Lihat Surat Permohonan"
                                        icon="pi pi-external-link"
                                        onClick={() => window.open(`${API_BASE}/${dataPerkara?.surat_permohonan}`, "_blank")}
                                        className="p-button-outlined p-button-sm"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigasi */}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            label="Batal"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(1)}
                        />

                        <Button
                            label="Selanjutnya"
                            className="p-button-warning"
                            onClick={() => setCurrentStep(currentStep + 1)}
                        />
                    </div>
                </div>
            ),
        },

        {
            label: "Resume",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Resume</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen resume di sini...</p>

                    <input
                        type="file"
                        id="resumeFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "resumeFile")}
                    />
                    <label
                        htmlFor="resumeFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Resume</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("resumeFile", "Resume", "resume")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(currentStep - 1)} />
                        <div className="flex justify-end gap-4 ">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
                        </div>
                    </div>
                </div>
            ),
        },


        {
            label: "SKK dan SPT",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-4">📑 SKK dan SPT</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen SKK dan SPT Anda di sini.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SKK */}
                        <div>
                            <input type="file" id="skkFile" className="hidden" onChange={(e) => handleFileSelect(e, "skkFile")} />
                            <label htmlFor="skkFile" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition">
                                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2 text-gray-700">📄 SKK</h3>
                                <p className="text-sm">Klik atau drag & drop file SKK</p>
                            </label>
                            {renderFilePreview("skkFile", "SKK", "skk")}
                        </div>

                        {/* SPT */}
                        <div>
                            <input type="file" id="sptFile" className="hidden" onChange={(e) => handleFileSelect(e, "sptFile")} />
                            <label htmlFor="sptFile" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition">
                                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2 text-gray-700">📄 SPT</h3>
                                <p className="text-sm">Klik atau drag & drop file SPT</p>
                            </label>
                            {renderFilePreview("sptFile", "SPT", "spt")}
                        </div>
                    </div>

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(currentStep - 1)} />
                        <div className="flex gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
                        </div>
                    </div>
                </div>
            ),
        },

        {
            label: "Catatan Sidang",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-4">📑 Catatan Sidang</h2>
                    <p className="text-gray-600 mb-6">Kelola catatan sidang di sini.</p>

                    {/* Tabel Menghadirkan Para Pihak */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-md font-semibold text-gray-700">Menghadirkan Para Pihak</h3>
                            <Button
                                label="Tambah"
                                icon="pi pi-plus"
                                className="p-button-sm"
                                onClick={() => setShowModal("pihak")}
                            />
                        </div>
                        <DataTable value={formData.menghadirkan_pihak} stripedRows className="p-datatable-sm">
                            <Column
                                header="No"
                                body={(_, options) => <span>{options.rowIndex + 1}</span>}
                                className="text-center w-[60px]"
                            />

                            <Column field="tanggal" header="Tanggal" body={(row) => formatTanggal(row.tanggal)} />
                            <Column field="para_pihak" header="Para Pihak" />
                            <Column field="kedudukan" header="Kedudukan" />
                            <Column field="keterangan" header="Keterangan" />
                            <Column
                                header="Aksi"
                                body={(rowData, options) => (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        onClick={() => {
                                            const updated = formData.menghadirkan_pihak.filter((_, i) => i !== options.rowIndex);
                                            setFormData((prev) => ({ ...prev, menghadirkan_pihak: updated }));
                                        }}
                                    />
                                )}
                            />
                        </DataTable>
                    </div>

                    {/* Tabel Mediasi */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-md font-semibold text-gray-700">Mediasi</h3>
                            <Button
                                label="Tambah"
                                icon="pi pi-plus"
                                className="p-button-sm"
                                onClick={() => setShowModal("mediasi")}
                            />
                        </div>
                        <DataTable value={formData.mediasi} stripedRows className="p-datatable-sm">
                            <Column
                                header="No"
                                body={(_, options) => options.rowIndex + 1}
                                style={{ width: "60px", textAlign: "center" }}
                            />
                            <Column field="tanggal" header="Tanggal" body={(row) => formatTanggal(row.tanggal)} />
                            <Column field="para_pihak" header="Para Pihak" />
                            <Column field="kedudukan" header="Kedudukan" />
                            <Column field="keterangan" header="Keterangan" />
                            <Column
                                header="Aksi"
                                body={(rowData, options) => (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        onClick={() => {
                                            const updated = formData.mediasi.filter((_, i) => i !== options.rowIndex);
                                            setFormData((prev) => ({ ...prev, mediasi: updated }));
                                        }}
                                    />
                                )}
                            />
                        </DataTable>
                    </div>

                    {/* Modal Tambah Catatan */}
                    <Dialog
                        header={showModal === "pihak" ? "Tambah Catatan Para Pihak" : "Tambah Catatan Mediasi"}
                        visible={showModal !== null}
                        style={{ width: "30rem" }}
                        modal
                        onHide={() => setShowModal(null)}
                    >
                        <div className="flex flex-col gap-3">
                            <label className="font-medium">Tanggal</label>
                            <Calendar
                                value={formCatatan.tanggal}
                                onChange={(e) => setFormCatatan({ ...formCatatan, tanggal: e.value as Date })}
                                dateFormat="dd-mm-yy"
                                className="w-full"
                                showIcon
                            />

                            <label className="font-medium">Para Pihak</label>
                            <InputText
                                value={formCatatan.para_pihak}
                                onChange={(e) => setFormCatatan({ ...formCatatan, para_pihak: e.target.value })}
                                placeholder="Nama Para Pihak"
                                className="w-full"
                            />

                            <label className="font-medium">Kedudukan</label>
                            <InputText
                                value={formCatatan.kedudukan}
                                onChange={(e) => setFormCatatan({ ...formCatatan, kedudukan: e.target.value })}
                                placeholder="Contoh: Penggugat / Tergugat"
                                className="w-full"
                            />

                            <label className="font-medium">Keterangan</label>
                            <InputTextarea
                                value={formCatatan.keterangan}
                                onChange={(e) => setFormCatatan({ ...formCatatan, keterangan: e.target.value })}
                                rows={3}
                                placeholder="Isi keterangan..."
                                className="w-full"
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <Button label="Batal" className="p-button-text" onClick={() => setShowModal(null)} />
                                <Button label="Simpan" onClick={handleTambahCatatan} />
                            </div>
                        </div>
                    </Dialog>

                    {/* Navigasi */}
                    <div className="flex justify-between mt-10 ">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="flex gap-4">
                            <Button label="Simpan" className="p-button-success" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            label: "Jawaban",
            content: (

                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Jawaban</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen jawaban di sini...</p>

                    <input type="file" id="jawabanFile" className="hidden" onChange={(e) => handleFileSelect(e, "jawabanFile")} />
                    <label
                        htmlFor="jawabanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Jawaban</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("jawabanFile", "Jawaban", "jawaban")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="justify-end gap-4 flex">
                            <Button label="Simpan" className="p-button-warning" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />

                        </div>
                    </div>
                </div>

            ),
        },

        {
            label: "Replik",
            content: (

                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Replik</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen replik di sini...</p>

                    <input type="file" id="replikFile" className="hidden" onChange={(e) => handleFileSelect(e, "replikFile")} />
                    <label
                        htmlFor="replikFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Replik</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("replikFile", "Replik", "replik")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="justify-end gap-4 flex">
                            <Button label="Simpan" className="p-button-warning" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />

                        </div>
                    </div>
                </div>

            ),
        },

        {
            label: "Duplik",
            content: (

                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Duplik</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen duplik di sini...</p>

                    <input type="file" id="duplikFile" className="hidden" onChange={(e) => handleFileSelect(e, "duplikFile")} />
                    <label
                        htmlFor="duplikFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Duplik</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("duplikFile", "Duplik", "duplik")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="justify-end gap-4 flex">
                            <Button label="Simpan" className="p-button-warning" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />

                        </div>
                    </div>
                </div>

            ),
        },
        {
            label: "Putusan Sela",
            content: (

                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Sela</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen putusan sela di sini...</p>

                    <input type="file" id="putusan_selaFile" className="hidden" onChange={(e) => handleFileSelect(e, "putusan_selaFile")} />
                    <label
                        htmlFor="putusan_selaFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Sela</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("putusan_selaFile", "Putusan Sela", "putusan_sela")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="justify-end gap-4 flex">
                            <Button label="Simpan" className="p-button-warning" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />

                        </div>                    </div>
                </div>

            ),
        },
        {
            label: "Kesimpulan",
            content: (

                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Kesimpulan</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen kesimpulan di sini...</p>

                    <input type="file" id="kesimpulanFile" className="hidden" onChange={(e) => handleFileSelect(e, "kesimpulanFile")} />
                    <label
                        htmlFor="kesimpulanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Kesimpulan</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("kesimpulanFile", "Kesimpulan", "kesimpulan")}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="flex justify-end gap-4 ">
                            <Button label="Simpan" className="p-button-warning" onClick={() => handleUpdate()} />
                            <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />

                        </div>
                    </div>
                </div>

            ),
        },
        {
            label: "Putusan Majelis",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Majelis</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen putusan majelis di sini...</p>

                    {/* Upload File */}
                    <input
                        type="file"
                        id="putusan_majelisFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "putusan_majelisFile")}
                    />
                    <label
                        htmlFor="putusan_majelisFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Majelis</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderFilePreview("putusan_majelisFile", "Putusan Majelis", "putusan_majelis")}
                    {/* Keputusan Menang/Kalah */}
                    <div className="mt-6">
                        <label className="font-medium text-gray-700 mb-2 block">Keputusan</label>
                        <Dropdown
                            value={formData.keputusan}
                            options={[
                                { label: "Menang", value: "menang" },
                                { label: "Kalah", value: "kalah" },
                            ]}
                            onChange={(e) => setFormData((prev) => ({ ...prev, keputusan: e.value }))}
                            placeholder="Pilih Keputusan"
                            className="w-full"
                        />
                    </div>

                    {/* Navigasi */}
                    <div className="flex justify-end gap-4 mt-10">

                        <Button label="Simpan" className="p-button-secondary" onClick={() => handleUpdate()} />
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(currentStep - 1)} />


                    </div>
                </div>
            ),
        }

    ];

    return (
        <div className="p-6 bg-[#FFFCF0] min-h-screen rounded-xl">
            <h1 className="text-2xl font-bold mb-8 text-center">Tahap Perkara</h1>

            <Stepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />

            <div className="relative w-full h-1 bg-gray-200 rounded my-6">
                <div className="absolute top-0 left-0 h-1 bg-[#0B5C4D] rounded transition-all duration-500" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
            </div>

            <div>{steps[currentStep - 1].content}</div>

            {/* Modal Upload Deskripsi */}
            <Dialog header="Tambah Deskripsi File" visible={showUploadModal !== null} style={{ width: "30rem" }} modal onHide={() => setShowUploadModal(null)}>
                <div className="flex flex-col gap-3">
                    {fileTemp && <p className="text-sm text-gray-700">File: <span className="font-semibold">{fileTemp.name}</span></p>}
                    <label className="font-medium">Deskripsi</label>
                    <InputTextarea value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} rows={3} placeholder="Tuliskan deskripsi file..." className="w-full" />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button label="Batal" className="p-button-text" onClick={() => setShowUploadModal(null)} />
                        <Button
                            label="Simpan"
                            onClick={() => {
                                if (!fileTemp) return;
                                setFormData((prev) => ({ ...prev, [showUploadModal!]: { file: fileTemp, deskripsi: fileDesc } }));
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
