"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { create } from "./api";
import { useAlert } from "@/context/AlertContext";
import { Dropdown } from "primereact/dropdown";

export default function PerkaraForm() {
    const { showAlert } = useAlert();

    const [form, setForm] = useState({
        surat_permohonan: null as File | null,
        relas: null as File | null,
        gugatan_upload: null as File | null,

        hari: "",
        tanggal: null as Date | null,
        ruang_sidang: "",
        agenda: "",
        penggugat: "",
        tergugat: "",
        turut_tergugat: "",
        nomor_perkara: "",
        tanggal_perkara: null as Date | null,
        gugatan: "",
        panitra_pengganti: "",
        pihak: "",
        penanggung_jawab: [] as string[],
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = (key: keyof typeof form, e: FileUploadSelectEvent) => {
        if (e.files && e.files.length > 0) {
            setForm({ ...form, [key]: e.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach((v) => formData.append(`${key}[]`, v));
                    } else if (value instanceof Date) {
                        formData.append(key, value.toISOString());
                    } else {
                        formData.append(key, value as any);
                    }
                }
            });

            await create(formData);
            showAlert("success", "Perkara berhasil ditambahkan ✅");

            setForm({
                surat_permohonan: null,
                relas: null,
                gugatan_upload: null,
                hari: "",
                tanggal: null,
                ruang_sidang: "",
                agenda: "",
                penggugat: "",
                tergugat: "",
                turut_tergugat: "",
                nomor_perkara: "",
                tanggal_perkara: null,
                gugatan: "",
                panitra_pengganti: "",
                pihak: "",
                penanggung_jawab: [],
            });
        } catch (err: any) {
            showAlert("error", err.message || "Gagal menambahkan perkara ❌");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center">
            <Card className="w-full">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Upload Surat Permohonan */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Surat Permohonan</label>
                        <FileUpload
                            mode="basic"
                            accept=".pdf,.jpg,.jpeg,.png"
                            chooseLabel="Pilih File"
                            className="w-full"
                            onSelect={(e) => handleFileSelect("surat_permohonan", e)}
                        />
                    </div>

                    {/* Upload Relas */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Relas</label>
                        <FileUpload
                            mode="basic"
                            accept=".pdf,.jpg,.jpeg,.png"
                            chooseLabel="Pilih File"
                            className="w-full"
                            onSelect={(e) => handleFileSelect("relas", e)}
                        />
                    </div>

                    {/* Upload Gugatan */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Gugatan</label>
                        <FileUpload
                            mode="basic"
                            accept=".pdf,.jpg,.jpeg,.png"
                            chooseLabel="Pilih File"
                            className="w-full"
                            onSelect={(e) => handleFileSelect("gugatan_upload", e)}
                        />
                    </div>

                    {/* Hari */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Hari</label>
                        <InputText
                            value={form.hari}
                            onChange={(e) => setForm({ ...form, hari: e.target.value })}
                            placeholder="Contoh: Senin"
                            className="w-full"
                        />
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tanggal</label>
                        <Calendar
                            value={form.tanggal}
                            onChange={(e) => setForm({ ...form, tanggal: e.value as Date | null })}
                            className="w-full"
                            dateFormat="dd-mm-yy"
                            showIcon
                        />
                    </div>

                    {/* Ruang Sidang */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Ruang Sidang</label>
                        <InputText
                            value={form.ruang_sidang}
                            onChange={(e) => setForm({ ...form, ruang_sidang: e.target.value })}
                            placeholder="Ruang 1 / Ruang Cakra"
                            className="w-full"
                        />
                    </div>

                    {/* Agenda */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Agenda</label>
                        <InputText
                            value={form.agenda}
                            onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                            placeholder="Agenda Sidang"
                            className="w-full"
                        />
                    </div>

                    {/* Penggugat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Penggugat</label>
                        <InputTextarea
                            value={form.penggugat}
                            onChange={(e) => setForm({ ...form, penggugat: e.target.value })}
                            rows={3}
                            placeholder="Nama / Identitas Penggugat"
                            className="w-full"
                        />
                    </div>

                    {/* Tergugat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tergugat</label>
                        <InputTextarea
                            value={form.tergugat}
                            onChange={(e) => setForm({ ...form, tergugat: e.target.value })}
                            rows={3}
                            placeholder="Nama / Identitas Tergugat"
                            className="w-full"
                        />
                    </div>

                    {/* Turut Tergugat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Turut Tergugat</label>
                        <InputTextarea
                            value={form.turut_tergugat}
                            onChange={(e) => setForm({ ...form, turut_tergugat: e.target.value })}
                            rows={3}
                            placeholder="Nama / Identitas Turut Tergugat"
                            className="w-full"
                        />
                    </div>

                    {/* Nomor Perkara */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nomor Perkara</label>
                        <InputText
                            value={form.nomor_perkara}
                            onChange={(e) => setForm({ ...form, nomor_perkara: e.target.value })}
                            placeholder="123/Pdt.G/2025/PN.Mdn"
                            className="w-full"
                        />
                    </div>

                    {/* Tanggal Perkara */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tanggal Perkara</label>
                        <Calendar
                            value={form.tanggal_perkara}
                            onChange={(e) => setForm({ ...form, tanggal_perkara: e.value as Date | null })}
                            className="w-full"
                            dateFormat="dd-mm-yy"
                            showIcon
                        />
                    </div>

                    {/* Jenis Gugatan */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Jenis Gugatan</label>
                        <Dropdown
                            value={form.gugatan}
                            options={[
                                { label: "Gugatan PMH", value: "Gugatan PMH" },
                                { label: "Gugatan Wanprestasi", value: "Gugatan Wanprestasi" },
                            ]}
                            onChange={(e) => setForm({ ...form, gugatan: e.value })}
                            placeholder="Pilih Jenis Gugatan"
                            className="w-full"
                        />
                    </div>

                    {/* Pihak */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Pihak</label>
                        <InputTextarea
                            value={form.pihak}
                            onChange={(e) => setForm({ ...form, pihak: e.target.value })}
                            rows={3}
                            placeholder="Keterangan pihak..."
                            className="w-full"
                        />
                    </div>

                    {/* Panitra Pengganti */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Panitra Pengganti</label>
                        <InputTextarea
                            value={form.panitra_pengganti}
                            onChange={(e) =>
                                setForm({ ...form, panitra_pengganti: e.target.value })
                            }
                            rows={3}
                            placeholder="Nama Panitra Pengganti"
                            className="w-full"
                        />
                    </div>

                    {/* Penanggung Jawab */}
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
                                setForm({
                                    ...form,
                                    penanggung_jawab: [...form.penanggung_jawab, ""],
                                })
                            }
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            label={isLoading ? "Mengirim..." : "Kirim Perkara"}
                            icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-send"}
                            disabled={isLoading}
                            className="p-button-success"
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
}
