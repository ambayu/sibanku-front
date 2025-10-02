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

export default function StepperPerkara() {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const params = useParams();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    // Modal Catatan Sidang
    const [showModal, setShowModal] = useState<"pihak" | "mediasi" | null>(null);

    // Modal Upload File
    const [showUploadModal, setShowUploadModal] = useState<
        null | "resumeFile" | "skkFile" | "sptFile" | "jawabanFile" | "replikFile" | "duplikFile" | "putusan_selaFile" | "putusan_majelisFile" | "kesimpulanFile"
    >(null);

    const [formData, setFormData] = useState({
        resumeFile: null as { file: File; deskripsi: string } | null,
        skkFile: null as { file: File; deskripsi: string } | null,
        sptFile: null as { file: File; deskripsi: string } | null,
        jawabanFile: null as { file: File; deskripsi: string } | null,
        replikFile: null as { file: File; deskripsi: string } | null,
        duplikFile: null as { file: File; deskripsi: string } | null,
        putusan_selaFile: null as { file: File; deskripsi: string } | null,
        putusan_majelisFile: null as { file: File; deskripsi: string } | null,
        kesimpulanFile: null as { file: File; deskripsi: string } | null,
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
    const handleFileSelect = (e: any, field: "resumeFile" | "skkFile" | "sptFile" | "jawabanFile" | "replikFile" | "duplikFile" | "putusan_selaFile" | "putusan_majelisFile" | "kesimpulanFile") => {
        let file: File | null = null;
        if (e.target?.files) file = e.target.files[0]; // input biasa
        if (e.files) file = e.files[0]; // primereact
        if (file) {
            setFileTemp(file);
            setFileDesc("");
            setShowUploadModal(field);
        }
    };

    const { data: dataPerkara, isLoading } = findOne(Number(params.id));

    const handleUpdate = async () => {
        const form = new FormData();

        // 📄 Dokumen sidang
        if (formData.resumeFile?.file) {
            form.append("resume", formData.resumeFile.file);
        }
        if (formData.resumeFile?.deskripsi) {
            form.append("resume_desc", formData.resumeFile.deskripsi);
        }

        if (formData.skkFile?.file) {
            form.append("skk", formData.skkFile.file);
        }
        if (formData.skkFile?.deskripsi) {
            form.append("skk_desc", formData.skkFile.deskripsi);
        }

        if (formData.sptFile?.file) {
            form.append("spt", formData.sptFile.file);
        }
        if (formData.sptFile?.deskripsi) {
            form.append("spt_desc", formData.sptFile.deskripsi);
        }

        if (formData.jawabanFile?.file) {
            form.append("jawaban", formData.jawabanFile.file);
        }
        if (formData.jawabanFile?.deskripsi) {
            form.append("jawaban_desc", formData.jawabanFile.deskripsi);
        }

        if (formData.replikFile?.file) {
            form.append("replik", formData.replikFile.file);
        }
        if (formData.replikFile?.deskripsi) {
            form.append("replik_desc", formData.replikFile.deskripsi);
        }

        if (formData.duplikFile?.file) {
            form.append("duplik", formData.duplikFile.file);
        }
        if (formData.duplikFile?.deskripsi) {
            form.append("duplik_desc", formData.duplikFile.deskripsi);
        }

        if (formData.putusan_selaFile?.file) {
            form.append("putusan_sela", formData.putusan_selaFile.file);
        }
        if (formData.putusan_selaFile?.deskripsi) {
            form.append("putusan_sela_desc", formData.putusan_selaFile.deskripsi);
        }

        if (formData.putusan_majelisFile?.file) {
            form.append("putusan_majelis", formData.putusan_majelisFile.file);
        }
        if (formData.putusan_majelisFile?.deskripsi) {
            form.append("putusan_majelis_desc", formData.putusan_majelisFile.deskripsi);
        }

        if (formData.kesimpulanFile?.file) {
            form.append("kesimpulan", formData.kesimpulanFile.file);
        }
        if (formData.kesimpulanFile?.deskripsi) {
            form.append("kesimpulan_desc", formData.kesimpulanFile.deskripsi);
        }

        // 🏆 keputusan (menang/kalah)
        if (formData.keputusan) {
            form.append("keputusan", formData.keputusan);
        }

        // 📝 Catatan Pihak
        formData.menghadirkan_pihak.forEach((catatan, i) => {
            form.append(`catatan_pihak[${i}][tanggal]`, catatan.tanggal?.toISOString() || "");
            form.append(`catatan_pihak[${i}][para_pihak]`, catatan.para_pihak);
            form.append(`catatan_pihak[${i}][kedudukan]`, catatan.kedudukan);
            form.append(`catatan_pihak[${i}][keterangan]`, catatan.keterangan);
        });

        // 📝 Catatan Mediasi
        formData.mediasi.forEach((catatan, i) => {
            form.append(`catatan_mediasi[${i}][tanggal]`, catatan.tanggal?.toISOString() || "");
            form.append(`catatan_mediasi[${i}][para_pihak]`, catatan.para_pihak);
            form.append(`catatan_mediasi[${i}][kedudukan]`, catatan.kedudukan);
            form.append(`catatan_mediasi[${i}][keterangan]`, catatan.keterangan);
        });

        try {
            await tahapPerkara(Number(params.id), form);
            showAlert("success", "Perkara berhasil diperbarui ✅");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal update perkara");
        }
    };



    useEffect(() => {
        if (!dataPerkara) return;

        setFormData((prev) => ({
            ...prev,
            // isi dokumen yang sudah ada
            resumeFile: dataPerkara.resume ? { file: null as any, deskripsi: dataPerkara.resume_desc || "" } : null,
            skkFile: dataPerkara.skk ? { file: null as any, deskripsi: dataPerkara.skk_desc || "" } : null,
            sptFile: dataPerkara.spt ? { file: null as any, deskripsi: dataPerkara.spt_desc || "" } : null,
            jawabanFile: dataPerkara.jawaban ? { file: null as any, deskripsi: dataPerkara.jawaban_desc || "" } : null,
            replikFile: dataPerkara.replik ? { file: null as any, deskripsi: dataPerkara.replik_desc || "" } : null,
            duplikFile: dataPerkara.duplik ? { file: null as any, deskripsi: dataPerkara.duplik_desc || "" } : null,
            putusan_selaFile: dataPerkara.putusan_sela ? { file: null as any, deskripsi: dataPerkara.putusan_sela_desc || "" } : null,
            putusan_majelisFile: dataPerkara.putusan_majelis ? { file: null as any, deskripsi: dataPerkara.putusan_majelis_desc || "" } : null,
            kesimpulanFile: dataPerkara.kesimpulan ? { file: null as any, deskripsi: dataPerkara.kesimpulan_desc || "" } : null,
            keputusan: dataPerkara.keputusan || "",
            menghadirkan_pihak: dataPerkara.catatan_pihak?.map((c: any) => ({
                tanggal: c.tanggal ? new Date(c.tanggal) : null,
                para_pihak: c.para_pihak,
                kedudukan: c.kedudukan,
                keterangan: c.keterangan,
            })) || [],
            mediasi: dataPerkara.catatan_mediasi?.map((c: any) => ({
                tanggal: c.tanggal ? new Date(c.tanggal) : null,
                para_pihak: c.para_pihak,
                kedudukan: c.kedudukan,
                keterangan: c.keterangan,
            })) || [],
        }));
    }, [dataPerkara]);

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
                                        onClick={() => window.open(`${API_BASE}/uploads/${dataPerkara?.surat_permohonan}`, "_blank")}
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

                    <input type="file" id="resumeFile" className="hidden" onChange={(e) => handleFileSelect(e, "resumeFile")} />
                    <label
                        htmlFor="resumeFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Resume</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {formData.resumeFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.resumeFile?.file?.name}</span></p>
                            <p>Deskripsi: {formData.resumeFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <div className="flex justify-end gap-2 ">
                            <Button label="Simpan" className="p-button-text" onClick={() => handleUpdate()} />
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
                            {formData.skkFile && (
                                <div className="mt-3 text-sm text-gray-700">
                                    <p>File: <span className="font-semibold">{formData.skkFile.file.name}</span></p>
                                    <p>Deskripsi: {formData.skkFile.deskripsi || "-"}</p>
                                </div>
                            )}
                        </div>

                        {/* SPT */}
                        <div>
                            <input type="file" id="sptFile" className="hidden" onChange={(e) => handleFileSelect(e, "sptFile")} />
                            <label htmlFor="sptFile" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition">
                                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2 text-gray-700">📄 SPT</h3>
                                <p className="text-sm">Klik atau drag & drop file SPT</p>
                            </label>
                            {formData.sptFile && (
                                <div className="mt-3 text-sm text-gray-700">
                                    <p>File: <span className="font-semibold">{formData.sptFile.file.name}</span></p>
                                    <p>Deskripsi: {formData.sptFile.deskripsi || "-"}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(currentStep - 1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
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

                    {formData.jawabanFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.jawabanFile.file.name}</span></p>
                            <p>Deskripsi: {formData.jawabanFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
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

                    {formData.replikFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.replikFile.file.name}</span></p>
                            <p>Deskripsi: {formData.replikFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
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

                    {formData.duplikFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.duplikFile.file.name}</span></p>
                            <p>Deskripsi: {formData.duplikFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
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

                    {formData.putusan_selaFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.putusan_selaFile.file.name}</span></p>
                            <p>Deskripsi: {formData.putusan_selaFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
                    </div>
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

                    {formData.kesimpulanFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>File: <span className="font-semibold">{formData.kesimpulanFile.file.name}</span></p>
                            <p>Deskripsi: {formData.kesimpulanFile.deskripsi || "-"}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button label="Selanjutnya" className="p-button-warning" onClick={() => setCurrentStep(currentStep + 1)} />
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

                    {/* Preview File */}
                    {formData.putusan_majelisFile && (
                        <div className="mt-3 text-sm text-gray-700">
                            <p>
                                File: <span className="font-semibold">{formData.putusan_majelisFile.file.name}</span>
                            </p>
                            <p>Deskripsi: {formData.putusan_majelisFile.deskripsi || "-"}</p>
                        </div>
                    )}

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
                    <div className="flex justify-between mt-10">
                        <Button label="Kembali" className="p-button-secondary" onClick={() => setCurrentStep(1)} />
                        <Button
                            label="Selanjutnya"
                            className="p-button-warning"
                            onClick={() => setCurrentStep(currentStep + 1)}
                        />
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
