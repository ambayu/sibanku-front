"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export default function PengaduanForm() {
    const [tanggal, setTanggal] = useState<Date | null>(null);
    const [tanggalPerdata, setTanggalPerdata] = useState<Date | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: kirim ke backend API pakai fetch/axios
        alert("Pengaduan terkirim ✅");
    };

    return (
        <div className=" flex justify-center ">
            <Card title="" className="w-full">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Upload Surat */}


                    {/* Hari */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Hari</label>
                        <InputText placeholder="Contoh: Senin" className="w-full" />
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tanggal</label>
                        <Calendar
                            value={tanggal}
                            onChange={(e) => setTanggal(e.value as Date)}
                            className="w-full"
                            dateFormat="dd-mm-yy"
                            showIcon
                        />
                    </div>

                    {/* Ruang Sidang */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Ruang Sidang</label>
                        <InputText placeholder="Ruang 1 / Ruang Cakra" className="w-full" />
                    </div>

                    {/* Agenda */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Agenda</label>
                        <InputText placeholder="Agenda Sidang" className="w-full" />
                    </div>

                    {/* Penggugat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Penggugat</label>
                        <InputText placeholder="Nama Penggugat" className="w-full" />
                    </div>

                    {/* Tergugat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tergugat</label>
                        <InputText placeholder="Nama Tergugat" className="w-full" />
                    </div>

                    {/* Nomor Perdata */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nomor Perdata</label>
                        <InputText placeholder="123/Pdt.G/2025/PN.Mdn" className="w-full" />
                    </div>

                    {/* Tanggal Perdata */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tanggal Perdata</label>
                        <Calendar
                            value={tanggalPerdata}
                            onChange={(e) => setTanggalPerdata(e.value as Date)}
                            className="w-full"
                            dateFormat="dd-mm-yy"
                            showIcon
                        />
                    </div>

                    {/* Gugatan */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Gugatan</label>
                        <InputTextarea
                            rows={4}
                            placeholder="Isi gugatan..."
                            className="w-full"
                        />
                    </div>

                    {/* Tombol Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            label="Kirim Pengaduan"
                            icon="pi pi-send"
                            className="p-button-success"
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
}
