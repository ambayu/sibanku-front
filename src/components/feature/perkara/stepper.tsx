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

type SingleFileState = {
    file: File | null;
    deskripsi: string;
    existing?: string; // path dari API (jika sudah ada)
} | null;

type MultiFileState = {
    file: File | null;
    deskripsi: string;
    existing?: string; // path existing, jika data lama
}[];

export default function StepperPerkara() {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const params = useParams();
    const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/uploads";

    // Modal Catatan Sidang
    const [showModal, setShowModal] = useState<"pihak" | "mediasi" | null>(null);

    // Modal deskripsi untuk SINGLE file
    const [showUploadModal, setShowUploadModal] = useState<
        | null
        | "resumeFile"
        | "skkFile"
        | "sptFile"
        | "putusan_selaFile"
        | "putusan_majelisFile"
        | "kesimpulanFile"
    >(null);
    const [fileTemp, setFileTemp] = useState<File | null>(null);
    const [fileDesc, setFileDesc] = useState("");

    // STATE UTAMA
    const [formData, setFormData] = useState({
        // SINGLE
        resumeFile: null as SingleFileState,
        skkFile: null as SingleFileState,
        sptFile: null as SingleFileState,
        putusan_selaFile: null as SingleFileState,
        putusan_majelisFile: null as SingleFileState,
        kesimpulanFile: null as SingleFileState,

        // MULTI
        jawabanFile: [] as MultiFileState,
        replikFile: [] as MultiFileState,
        duplikFile: [] as MultiFileState,

        keputusan: "",
        // Catatan pihak & mediasi (tanpa kedudukan)
        menghadirkan_pihak: [] as {
            tanggal: Date | null;
            para_pihak: string; // multiline dipisah \n
            keterangan: string;
        }[],
        mediasi: [] as {
            tanggal: Date | null;
            para_pihak: string; // multiline dipisah \n
            keterangan: string; // ini labelnya "Laporan Hasil Mediasi" di UI
        }[],
    });

    const [formCatatan, setFormCatatan] = useState({
        tanggal: null as Date | null,
        para_pihak: [] as string[],
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
        if (!formCatatan.tanggal || !formCatatan.para_pihak) {
            showAlert("error", "Tanggal dan Para Pihak harus diisi");
            return;
        }

        setFormData((prev: any) => {
            if (showModal === "pihak") {
                return {
                    ...prev,
                    menghadirkan_pihak: [
                        ...prev.menghadirkan_pihak,
                        { ...formCatatan },
                    ],
                };
            }
            if (showModal === "mediasi") {
                return {
                    ...prev,
                    mediasi: [...prev.mediasi, { ...formCatatan }],
                };
            }
            return prev;
        });

        setFormCatatan({ tanggal: null, para_pihak: [], keterangan: "" });

        setShowModal(null);
    };

    // Upload File → SINGLE: buka modal deskripsi; MULTI: langsung push array item
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
        const files: FileList | File[] | undefined = e.target?.files || e.files;
        if (!files || (files as any).length === 0) return;

        const isMulti = ["jawabanFile", "replikFile", "duplikFile"].includes(field);

        if (isMulti) {
            const arr = Array.from(files as FileList).map((f) => ({
                file: f,
                deskripsi: "",
            }));
            setFormData((prev) => ({
                ...prev,
                [field]: ([...((prev as any)[field] as MultiFileState), ...arr] as unknown) as MultiFileState,
            }));
            return;
        }

        // SINGLE
        const first = (files as FileList)[0];
        if (first) {
            setFileTemp(first);
            setFileDesc("");
            setShowUploadModal(field as typeof showUploadModal);
        }
    };

    const { data: dataPerkara, isLoading } = findOne(Number(params.id));
    console.log("📂 dataPerkara:", dataPerkara);
    // Kirim ke server
    const handleUpdate = async () => {
        const form = new FormData();

        // helper untuk SINGLE
        const appendSingle = (
            key: keyof typeof formData,
            fieldName: string
        ) => {
            const data = formData[key] as SingleFileState;
            if (!data) return;
            if (data.file) form.append(fieldName, data.file);
            if (data.deskripsi) form.append(`${fieldName}_desc`, data.deskripsi);
        };

        // helper untuk MULTI
        const appendMulti = (
            key: keyof typeof formData,
            fieldName: string
        ) => {
            const list = formData[key] as MultiFileState;
            if (!Array.isArray(list) || list.length === 0) return;
            list.forEach((item) => {
                if (item.file) form.append(fieldName, item.file); // ⬅️ tanpa []
                if (item.deskripsi) form.append(`${fieldName}_desc`, item.deskripsi);
            });
        };


        // SINGLE
        appendSingle("resumeFile", "resume");
        appendSingle("skkFile", "skk");
        appendSingle("sptFile", "spt");
        appendSingle("putusan_selaFile", "putusan_sela");
        appendSingle("putusan_majelisFile", "putusan_majelis");
        appendSingle("kesimpulanFile", "kesimpulan");

        // MULTI
        appendMulti("jawabanFile", "jawaban");
        appendMulti("replikFile", "replik");
        appendMulti("duplikFile", "duplik");

        // keputusan
        if (formData.keputusan) form.append("keputusan", formData.keputusan);

        // serialize catatan (tanpa kedudukan), para_pihak bisa multiline
        if (formData.menghadirkan_pihak.length > 0) {
            form.append("catatan_pihak", JSON.stringify(formData.menghadirkan_pihak));
        }
        if (formData.mediasi.length > 0) {
            form.append("catatan_mediasi", JSON.stringify(formData.mediasi));
        }

        try {
            await tahapPerkara(Number(params.id), form); // <- pastikan method PUT/POST (bukan PATCH)
            showAlert("success", "Perkara berhasil diperbarui ✅");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal update perkara");
        }
    };

    // preview untuk SINGLE
    const renderSinglePreview = (
        data: SingleFileState,
        label: string,
        fieldName: string
    ) => {
        if (!data) return null;
        const hasNew = !!data.file;
        const fileLabel = hasNew ? data.file!.name : data.existing;
        const url = hasNew
            ? URL.createObjectURL(data.file as File)
            : data.existing
                ? `${API_BASE}/${data.existing}`
                : null;

        return (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                {fileLabel && (
                    <div className="flex items-center justify-between mb-2 p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                            <i className={`pi ${hasNew ? "pi-cloud-upload text-green-500" : "pi-file text-blue-500"}`} />
                            <span className="text-sm font-medium">{fileLabel}</span>
                        </div>
                        {url && (
                            <Button
                                type="button"
                                label="Lihat"
                                icon="pi pi-external-link"
                                onClick={() => window.open(url, "_blank")}
                                className="p-button-outlined p-button-sm"
                            />
                        )}
                    </div>
                )}

                <div className="text-sm text-gray-600 p-2 bg-white rounded">
                    <span className="font-medium">Deskripsi:</span>{" "}
                    {data.deskripsi || "-"}
                </div>
            </div>
        );
    };

    // preview untuk MULTI
    const renderMultiPreview = (list: MultiFileState, label: string, fieldKey: "jawabanFile" | "replikFile" | "duplikFile", serverFieldName: string) => {
        if (!list || list.length === 0) return null;
        return (
            <div className="mt-4 space-y-3">
                {list.map((item, idx) => {
                    const url = item.file
                        ? URL.createObjectURL(item.file as File)
                        : item.existing
                            ? `${API_BASE}/${item.existing}`
                            : null;

                    return (
                        <div key={`${serverFieldName}-${idx}`} className="border rounded bg-white p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <i className={`pi ${item.file ? "pi-cloud-upload text-green-500" : "pi-file text-blue-500"}`} />
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
                                            setFormData((prev) => ({
                                                ...prev,
                                                [fieldKey]: (prev[fieldKey] as MultiFileState).filter((_, i) => i !== idx),
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Edit deskripsi per file */}
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

    // mapping API → state
    useEffect(() => {
        if (!dataPerkara) return;

        const mapSingle = (path?: string, desc?: string): SingleFileState =>
            path
                ? {
                    file: null,
                    deskripsi: desc || "",
                    existing: path,
                }
                : null;

        // 🟩 Map multi file dari struktur JSON baru
        const mapMultiFromJson = (
            json?: { files?: string[]; desc?: string[] }
        ): MultiFileState => {
            if (!json || !Array.isArray(json.files)) return [];
            return json.files.map((f, i) => ({
                file: null,
                existing: f,
                deskripsi: json.desc?.[i] || "",
            }));
        };

        // 🟩 Map lama (kalau backend masih pakai array string biasa)
        const mapMultiLegacy = (
            paths?: string[] | string,
            descs?: string[] | string
        ): MultiFileState => {
            if (!paths) return [];
            if (Array.isArray(paths)) {
                return paths.map((p, i) => ({
                    file: null,
                    existing: p,
                    deskripsi: Array.isArray(descs) ? descs[i] || "" : descs || "",
                }));
            }
            return [
                {
                    file: null,
                    existing: paths,
                    deskripsi: Array.isArray(descs) ? descs[0] || "" : descs || "",
                },
            ];
        };

        setFormData((prev) => ({
            ...prev,

            // 🟩 SINGLE
            resumeFile: mapSingle(dataPerkara.resume, dataPerkara.resume_desc),
            skkFile: mapSingle(dataPerkara.skk, dataPerkara.skk_desc),
            sptFile: mapSingle(dataPerkara.spt, dataPerkara.spt_desc),
            putusan_selaFile: mapSingle(
                dataPerkara.putusan_sela,
                dataPerkara.putusan_sela_desc
            ),
            putusan_majelisFile: mapSingle(
                dataPerkara.putusan_majelis,
                dataPerkara.putusan_majelis_desc
            ),
            kesimpulanFile: mapSingle(
                dataPerkara.kesimpulan,
                dataPerkara.kesimpulan_desc
            ),

            // 🟩 MULTI — ambil dari JSON modern
            jawabanFile: mapMultiFromJson(dataPerkara.jawaban_json) || [],
            replikFile: mapMultiFromJson(dataPerkara.replik_json) || [],
            duplikFile: mapMultiFromJson(dataPerkara.duplik_json) || [],

            keputusan: dataPerkara.keputusan || "",

            // 🟩 Catatan para pihak dan mediasi
            menghadirkan_pihak:
                dataPerkara.catatan_pihak?.map((c: any) => ({
                    tanggal: c.tanggal ? new Date(c.tanggal) : null,
                    para_pihak: c.para_pihak,
                    keterangan: c.keterangan,
                })) || [],
            mediasi:
                dataPerkara.catatan_mediasi?.map((c: any) => ({
                    tanggal: c.tanggal ? new Date(c.tanggal) : null,
                    para_pihak: c.para_pihak,
                    keterangan: c.keterangan,
                })) || [],
        }));
    }, [dataPerkara, API_BASE]);


    // ====== STEP DEFINITIONS ======
    const steps: Step[] = [
        {
            label: "Dokumen Awal",
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-4">📄 Dokumen Awal</h2>
                    <p className="text-gray-600 mb-6">
                        Detail informasi dari dokumen awal perkara
                    </p>

                    {isLoading ? (
                        <Skeleton width="100%" height="10rem" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 rounded-lg bg-white shadow-sm ">
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900 w-1/3">
                                            Nomor Perkara
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.nomor_perkara || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">Hari</td>
                                        <td className="px-4 py-2">{dataPerkara?.hari || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Tanggal
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatTanggal(dataPerkara?.tanggal) || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Ruang Sidang
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.ruang_sidang || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Agenda
                                        </td>
                                        <td className="px-4 py-2">{dataPerkara?.agenda || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Penggugat
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.penggugat || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Tergugat
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.tergugat || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Turut Tergugat
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.turut_tergugat || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Tanggal Perkara
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatTanggal(dataPerkara?.tanggal_perkara) || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Jenis Gugatan
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.gugatan || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Pihak
                                        </td>
                                        <td className="px-4 py-2 whitespace-pre-line">
                                            {dataPerkara?.pihak || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Panitra Pengganti
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.panitra_pengganti || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-bold text-gray-900">
                                            Penanggung Jawab
                                        </td>
                                        <td className="px-4 py-2">
                                            {dataPerkara?.penanggung_jawabs
                                                ?.map((pj: any) => pj.nama)
                                                .join(", ") || "-"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {(dataPerkara?.surat_permohonan ||
                                dataPerkara?.relas ||
                                dataPerkara?.gugatan_upload) && (
                                    <div className="flex gap-6 flex-wrap">
                                        {dataPerkara?.surat_permohonan && (
                                            <div className="mt-4">
                                                <Button
                                                    type="button"
                                                    label="Lihat Surat Permohonan"
                                                    icon="pi pi-external-link"
                                                    onClick={() =>
                                                        window.open(
                                                            `${API_BASE}/${dataPerkara?.surat_permohonan}`,
                                                            "_blank"
                                                        )
                                                    }
                                                    className="p-button-outlined p-button-sm"
                                                />
                                            </div>
                                        )}
                                        {dataPerkara?.relas && (
                                            <div className="mt-4">
                                                <Button
                                                    type="button"
                                                    label="Lihat Relas"
                                                    icon="pi pi-external-link"
                                                    onClick={() =>
                                                        window.open(
                                                            `${API_BASE}/${dataPerkara?.relas}`,
                                                            "_blank"
                                                        )
                                                    }
                                                    className="p-button-outlined p-button-sm"
                                                />
                                            </div>
                                        )}
                                        {dataPerkara?.gugatan_upload && (
                                            <div className="mt-4">
                                                <Button
                                                    type="button"
                                                    label="Lihat Gugatan"
                                                    icon="pi pi-external-link"
                                                    onClick={() =>
                                                        window.open(
                                                            `${API_BASE}/${dataPerkara?.gugatan_upload}`,
                                                            "_blank"
                                                        )
                                                    }
                                                    className="p-button-outlined p-button-sm"
                                                />
                                            </div>
                                        )}
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

        // ====== RESUME (SINGLE) ======
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
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                    <label
                        htmlFor="resumeFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Resume</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderSinglePreview(formData.resumeFile, "Resume", "resume")}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="flex justify-end gap-4 ">
                            <Button
                                label="Simpan"
                                className="p-button-success"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== SKK & SPT (SINGLE) ======
        {
            label: "SKK dan SPT",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-4">📑 SKK dan SPT</h2>
                    <p className="text-gray-600 mb-6">
                        Unggah dokumen SKK dan SPT Anda di sini.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SKK */}
                        <div>
                            <input
                                type="file"
                                id="skkFile"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, "skkFile")}
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                            />
                            <label
                                htmlFor="skkFile"
                                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                            >
                                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2 text-gray-700">📄 SKK</h3>
                                <p className="text-sm">Klik atau drag & drop file SKK</p>
                            </label>
                            {renderSinglePreview(formData.skkFile, "SKK", "skk")}
                        </div>

                        {/* SPT */}
                        <div>
                            <input
                                type="file"
                                id="sptFile"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, "sptFile")}
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                            />
                            <label
                                htmlFor="sptFile"
                                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                            >
                                <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2 text-gray-700">📄 SPT</h3>
                                <p className="text-sm">Klik atau drag & drop file SPT</p>
                            </label>
                            {renderSinglePreview(formData.sptFile, "SPT", "spt")}
                        </div>
                    </div>

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="flex gap-4">
                            <Button
                                label="Simpan"
                                className="p-button-success"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== CATATAN SIDANG ======
        {
            label: "Catatan Sidang",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-4">📑 Catatan Sidang</h2>
                    <p className="text-gray-600 mb-6">Kelola catatan sidang di sini.</p>

                    {/* Tabel Menghadirkan Para Pihak */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-md font-semibold text-gray-700">
                                Menghadirkan Para Pihak
                            </h3>
                            <Button
                                label="Tambah"
                                icon="pi pi-plus"
                                className="p-button-sm"
                                onClick={() => setShowModal("pihak")}
                            />
                        </div>
                        <DataTable
                            value={formData.menghadirkan_pihak}
                            stripedRows
                            className="p-datatable-sm"
                        >
                            <Column
                                header="No"
                                body={(_, options) => <span>{options.rowIndex + 1}</span>}
                                className="text-center w-[60px]"
                            />

                            <Column
                                field="tanggal"
                                header="Tanggal"
                                body={(row) => formatTanggal(row.tanggal)}
                            />
                            <Column
                                field="para_pihak"
                                header="Para Pihak"
                                body={(row) => {
                                    let pihak = row.para_pihak;

                                    // ✅ 1. Kalau array dengan string JSON di dalamnya → parse lapisan pertama
                                    if (Array.isArray(pihak) && typeof pihak[0] === "string") {
                                        try {
                                            const parsed = JSON.parse(pihak[0]);
                                            if (Array.isArray(parsed)) {
                                                return (
                                                    <div style={{ whiteSpace: "pre-line" }}>
                                                        {parsed.join("\n")}
                                                    </div>
                                                );
                                            }
                                        } catch (err) {
                                            // fallback ke gabung array biasa
                                            return (
                                                <div style={{ whiteSpace: "pre-line" }}>
                                                    {pihak.join("\n")}
                                                </div>
                                            );
                                        }
                                    }

                                    // ✅ 2. Kalau string JSON langsung (bukan array luar)
                                    if (typeof pihak === "string" && pihak.startsWith("[")) {
                                        try {
                                            const parsed = JSON.parse(pihak);
                                            if (Array.isArray(parsed)) {
                                                return (
                                                    <div style={{ whiteSpace: "pre-line" }}>
                                                        {parsed.join("\n")}
                                                    </div>
                                                );
                                            }
                                        } catch (err) {
                                            return (
                                                <div style={{ whiteSpace: "pre-line" }}>{pihak}</div>
                                            );
                                        }
                                    }

                                    // ✅ 3. Kalau sudah array biasa
                                    if (Array.isArray(pihak)) {
                                        return (
                                            <div style={{ whiteSpace: "pre-line" }}>
                                                {pihak.join("\n")}
                                            </div>
                                        );
                                    }

                                    // ✅ 4. Fallback teks biasa
                                    return <div style={{ whiteSpace: "pre-line" }}>{pihak || "-"}</div>;
                                }}
                            />


                            <Column field="keterangan" header="Keterangan" />
                            <Column
                                header="Aksi"
                                body={(rowData, options) => (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        onClick={() => {
                                            const updated = formData.menghadirkan_pihak.filter(
                                                (_, i) => i !== options.rowIndex
                                            );
                                            setFormData((prev) => ({
                                                ...prev,
                                                menghadirkan_pihak: updated,
                                            }));
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
                            <Column
                                field="tanggal"
                                header="Tanggal"
                                body={(row) => formatTanggal(row.tanggal)}
                            />
                            <Column
                                field="para_pihak"
                                header="Para Pihak"
                                body={(row) => {
                                    let pihak = row.para_pihak;

                                    // ✅ 1. Kalau array dengan string JSON di dalamnya → parse lapisan pertama
                                    if (Array.isArray(pihak) && typeof pihak[0] === "string") {
                                        try {
                                            const parsed = JSON.parse(pihak[0]);
                                            if (Array.isArray(parsed)) {
                                                return (
                                                    <div style={{ whiteSpace: "pre-line" }}>
                                                        {parsed.join("\n")}
                                                    </div>
                                                );
                                            }
                                        } catch (err) {
                                            // fallback ke gabung array biasa
                                            return (
                                                <div style={{ whiteSpace: "pre-line" }}>
                                                    {pihak.join("\n")}
                                                </div>
                                            );
                                        }
                                    }

                                    // ✅ 2. Kalau string JSON langsung (bukan array luar)
                                    if (typeof pihak === "string" && pihak.startsWith("[")) {
                                        try {
                                            const parsed = JSON.parse(pihak);
                                            if (Array.isArray(parsed)) {
                                                return (
                                                    <div style={{ whiteSpace: "pre-line" }}>
                                                        {parsed.join("\n")}
                                                    </div>
                                                );
                                            }
                                        } catch (err) {
                                            return (
                                                <div style={{ whiteSpace: "pre-line" }}>{pihak}</div>
                                            );
                                        }
                                    }

                                    // ✅ 3. Kalau sudah array biasa
                                    if (Array.isArray(pihak)) {
                                        return (
                                            <div style={{ whiteSpace: "pre-line" }}>
                                                {pihak.join("\n")}
                                            </div>
                                        );
                                    }

                                    // ✅ 4. Fallback teks biasa
                                    return <div style={{ whiteSpace: "pre-line" }}>{pihak || "-"}</div>;
                                }}
                            />


                            <Column field="keterangan" header="Laporan Hasil Mediasi" />
                            <Column
                                header="Aksi"
                                body={(rowData, options) => (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        onClick={() => {
                                            const updated = formData.mediasi.filter(
                                                (_, i) => i !== options.rowIndex
                                            );
                                            setFormData((prev) => ({
                                                ...prev,
                                                mediasi: updated,
                                            }));
                                        }}
                                    />
                                )}
                            />
                        </DataTable>
                    </div>

                    <Dialog
                        header={showModal === "pihak" ? "Tambah Catatan Para Pihak" : "Tambah Catatan Mediasi"}
                        visible={showModal !== null}
                        style={{ width: "70rem" }}
                        modal
                        onHide={() => setShowModal(null)}
                    >
                        <div className="flex flex-col gap-3">
                            <label className="font-medium">Tanggal</label>
                            <Calendar
                                value={formCatatan.tanggal}
                                onChange={(e) =>
                                    setFormCatatan({
                                        ...formCatatan,
                                        tanggal: e.value as Date,
                                    })
                                }
                                dateFormat="dd-mm-yy"
                                className="w-full"
                                showIcon
                            />

                            {showModal === "pihak" && (
                                <>
                                    <label className="font-medium mt-3">Daftar Para Pihak</label>

                                    <DataTable
                                        value={formCatatan.para_pihak || []}
                                        className="p-datatable-sm"
                                        emptyMessage="Belum ada pihak ditambahkan"
                                    >
                                        <Column
                                            header="No"
                                            body={(_, opt) => opt.rowIndex + 1}
                                            className="text-center w-[60px]"
                                        />
                                        <Column
                                            header="Nama Pihak"
                                            body={(row, opt) => (
                                                <InputText
                                                    value={row}
                                                    onChange={(e) => {
                                                        const updated = [...(formCatatan.para_pihak || [])];
                                                        updated[opt.rowIndex] = e.target.value;
                                                        setFormCatatan({ ...formCatatan, para_pihak: updated });
                                                    }}
                                                    className="w-full"
                                                    placeholder="Nama pihak"
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Aksi"
                                            body={(_, opt) => (
                                                <Button
                                                    icon="pi pi-trash"
                                                    className="p-button-text p-button-danger p-button-rounded"
                                                    onClick={() => {
                                                        const updated = formCatatan.para_pihak.filter(
                                                            (_, i) => i !== opt.rowIndex
                                                        );
                                                        setFormCatatan({ ...formCatatan, para_pihak: updated });
                                                    }}
                                                />
                                            )}
                                        />
                                    </DataTable>

                                    <div className="mt-3">
                                        <Button
                                            label="Tambah Pihak"
                                            icon="pi pi-plus"
                                            className="p-button-sm"
                                            onClick={() => {
                                                const newList = [...(formCatatan.para_pihak || []), ""];
                                                setFormCatatan({ ...formCatatan, para_pihak: newList });
                                            }}
                                        />
                                    </div>

                                    {/* Keterangan umum (tidak per pihak) */}
                                    <label className="font-medium mt-4">Keterangan</label>
                                    <InputTextarea
                                        value={formCatatan.keterangan}
                                        onChange={(e) =>
                                            setFormCatatan({ ...formCatatan, keterangan: e.target.value })
                                        }
                                        rows={3}
                                        placeholder="Isi keterangan umum..."
                                        className="w-full"
                                    />
                                </>
                            )}

                            {showModal === "mediasi" && (
                                <>
                                    <label className="font-medium mt-3">Daftar Para Pihak (Mediasi)</label>

                                    <DataTable
                                        value={formCatatan.para_pihak || []}
                                        className="p-datatable-sm"
                                        emptyMessage="Belum ada pihak ditambahkan"
                                    >
                                        <Column
                                            header="No"
                                            body={(_, opt) => opt.rowIndex + 1}
                                            className="text-center w-[60px]"
                                        />
                                        <Column
                                            header="Nama Pihak"
                                            body={(row, opt) => (
                                                <InputText
                                                    value={row}
                                                    onChange={(e) => {
                                                        const updated = [...(formCatatan.para_pihak || [])];
                                                        updated[opt.rowIndex] = e.target.value;
                                                        setFormCatatan({ ...formCatatan, para_pihak: updated });
                                                    }}
                                                    className="w-full"
                                                    placeholder="Nama pihak"
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Aksi"
                                            body={(_, opt) => (
                                                <Button
                                                    icon="pi pi-trash"
                                                    className="p-button-text p-button-danger p-button-rounded"
                                                    onClick={() => {
                                                        const updated = formCatatan.para_pihak.filter(
                                                            (_, i) => i !== opt.rowIndex
                                                        );
                                                        setFormCatatan({ ...formCatatan, para_pihak: updated });
                                                    }}
                                                />
                                            )}
                                        />
                                    </DataTable>

                                    <div className="mt-3">
                                        <Button
                                            label="Tambah Pihak"
                                            icon="pi pi-plus"
                                            className="p-button-sm"
                                            onClick={() => {
                                                const newList = [...(formCatatan.para_pihak || []), ""];
                                                setFormCatatan({ ...formCatatan, para_pihak: newList });
                                            }}
                                        />
                                    </div>

                                    {/* 🔹 Tambahkan field laporan hasil mediasi */}
                                    <label className="font-medium mt-4">Laporan Hasil Mediasi</label>
                                    <InputTextarea
                                        value={formCatatan.keterangan}
                                        onChange={(e) =>
                                            setFormCatatan({
                                                ...formCatatan,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        placeholder="Tuliskan hasil mediasi..."
                                        className="w-full"
                                    />
                                </>
                            )}


                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    label="Batal"
                                    className="p-button-text"
                                    onClick={() => setShowModal(null)}
                                />
                                <Button
                                    label="Simpan"
                                    onClick={() => {
                                        if (showModal === "pihak") {
                                            if (
                                                !formCatatan.tanggal ||
                                                !formCatatan.para_pihak?.length ||
                                                formCatatan.para_pihak.some((p) => !p)
                                            ) {
                                                showAlert("error", "Tanggal dan nama pihak wajib diisi");
                                                return;
                                            }
                                            setFormData((prev) => ({
                                                ...prev,
                                                menghadirkan_pihak: [
                                                    ...prev.menghadirkan_pihak,
                                                    {
                                                        tanggal: formCatatan.tanggal,
                                                        para_pihak: JSON.stringify(formCatatan.para_pihak),
                                                        keterangan: formCatatan.keterangan,
                                                    },
                                                ],
                                            }));
                                        } else {
                                            handleTambahCatatan();
                                        }

                                        setFormCatatan({
                                            tanggal: null,
                                            para_pihak: [],
                                            keterangan: "",
                                        });
                                        setShowModal(null);
                                    }}
                                />
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
                            <Button
                                label="Simpan"
                                className="p-button-success"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== JAWABAN (MULTI) ======
        {
            label: "Jawaban",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Jawaban</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen jawaban di sini...</p>

                    <input
                        type="file"
                        id="jawabanFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "jawabanFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                    />
                    <label
                        htmlFor="jawabanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Jawaban (bisa banyak file)</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderMultiPreview(formData.jawabanFile, "Jawaban", "jawabanFile", "jawaban")}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="justify-end gap-4 flex">
                            <Button
                                label="Simpan"
                                className="p-button-warning"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== REPLIK (MULTI) ======
        {
            label: "Replik",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Replik</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen replik di sini...</p>

                    <input
                        type="file"
                        id="replikFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "replikFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                    />
                    <label
                        htmlFor="replikFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Replik (bisa banyak file)</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderMultiPreview(formData.replikFile, "Replik", "replikFile", "replik")}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="justify-end gap-4 flex">
                            <Button
                                label="Simpan"
                                className="p-button-warning"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== DUPLIK (MULTI) ======
        {
            label: "Duplik",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Duplik</h2>
                    <p className="text-gray-600 mb-6">Unggah dokumen duplik di sini...</p>

                    <input
                        type="file"
                        id="duplikFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "duplikFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                    />
                    <label
                        htmlFor="duplikFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Duplik (bisa banyak file)</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderMultiPreview(formData.duplikFile, "Duplik", "duplikFile", "duplik")}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="justify-end gap-4 flex">
                            <Button
                                label="Simpan"
                                className="p-button-warning"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== PUTUSAN SELA (SINGLE) ======
        {
            label: "Putusan Sela",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Sela</h2>
                    <p className="text-gray-600 mb-6">
                        Unggah dokumen putusan sela di sini...
                    </p>

                    <input
                        type="file"
                        id="putusan_selaFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "putusan_selaFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                    <label
                        htmlFor="putusan_selaFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Sela</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderSinglePreview(
                        formData.putusan_selaFile,
                        "Putusan Sela",
                        "putusan_sela"
                    )}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="justify-end gap-4 flex">
                            <Button
                                label="Simpan"
                                className="p-button-warning"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== KESIMPULAN (SINGLE) ======
        {
            label: "Kesimpulan",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Kesimpulan</h2>
                    <p className="text-gray-600 mb-6">
                        Unggah dokumen kesimpulan di sini...
                    </p>

                    <input
                        type="file"
                        id="kesimpulanFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "kesimpulanFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                    <label
                        htmlFor="kesimpulanFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Kesimpulan</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderSinglePreview(
                        formData.kesimpulanFile,
                        "Kesimpulan",
                        "kesimpulan"
                    )}

                    <div className="flex justify-between mt-10">
                        <Button
                            label="Kembali"
                            className="p-button-secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        />
                        <div className="flex justify-end gap-4 ">
                            <Button
                                label="Simpan"
                                className="p-button-warning"
                                onClick={() => handleUpdate()}
                            />
                            <Button
                                label="Selanjutnya"
                                className="p-button-warning"
                                onClick={() => setCurrentStep(currentStep + 1)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        // ====== PUTUSAN MAJELIS (SINGLE) ======
        {
            label: "Putusan Majelis",
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">📑 Putusan Majelis</h2>
                    <p className="text-gray-600 mb-6">
                        Unggah dokumen putusan majelis di sini...
                    </p>

                    {/* Upload File */}
                    <input
                        type="file"
                        id="putusan_majelisFile"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "putusan_majelisFile")}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                    <label
                        htmlFor="putusan_majelisFile"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition"
                    >
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Putusan Majelis</p>
                        <p className="text-sm">Klik atau drag & drop</p>
                    </label>

                    {renderSinglePreview(
                        formData.putusan_majelisFile,
                        "Putusan Majelis",
                        "putusan_majelis"
                    )}

                    {/* Keputusan Menang/Kalah */}
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

                    {/* Navigasi */}
                    <div className="flex justify-end gap-4 mt-10">
                        <Button
                            label="Simpan"
                            className="p-button-secondary"
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
        },
    ];

    return (
        <div className="p-6 bg-[#FFFCF0] min-h-screen rounded-xl">
            <h1 className="text-2xl font-bold mb-8 text-center">Tahap Perkara</h1>

            <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
            />

            <div className="relative w-full h-1 bg-gray-200 rounded my-6">
                <div
                    className="absolute top-0 left-0 h-1 bg-[#0B5C4D] rounded transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
            </div>

            <div>{steps[currentStep - 1].content}</div>

            {/* Modal Upload Deskripsi untuk SINGLE field */}
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
                        <Button
                            label="Batal"
                            className="p-button-text"
                            onClick={() => setShowUploadModal(null)}
                        />
                        <Button
                            label="Simpan"
                            onClick={() => {
                                if (!fileTemp || !showUploadModal) return;
                                setFormData((prev) => ({
                                    ...prev,
                                    [showUploadModal]: {
                                        file: fileTemp,
                                        deskripsi: fileDesc,
                                    },
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
