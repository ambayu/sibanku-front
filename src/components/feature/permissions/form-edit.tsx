"use client";

import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { findOne, update } from "./api"; // API file kamu

export default function PermissionEditForm() {
    const { showAlert } = useAlert();
    const params = useParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const { data: permission } = findOne(Number(params.id));

    // Fetch data permission by id
    useEffect(() => {
        if (permission) {
            setName(permission.name);
            setIsFetching(false);
        }
    }, [permission]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showAlert("error", "Nama permission tidak boleh kosong");
            return;
        }

        setIsLoading(true);
        try {
            await update(Number(params.id), { name });
            showAlert("success", "Permission berhasil diperbarui ✅");
            router.push("/admin/permissions"); // kembali ke list
        } catch (error: any) {
            showAlert("error", error.message || "Gagal memperbarui permission");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <p className="text-center mt-10">🔄 Memuat data permission...</p>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow ">


            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Input Nama Permission */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">
                        Nama Permission
                    </label>
                    <InputText
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: user:create"
                        className="w-full"
                    />
                </div>

                <div className="flex justify-between mt-4">
                    <Button
                        type="button"
                        label="Kembali"
                        icon="pi pi-arrow-left"
                        className="p-button-secondary"
                        onClick={() => router.push("/admin/permission")}
                    />
                    <Button
                        type="submit"
                        label={isLoading ? "Menyimpan..." : "Simpan"}
                        icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-save"}
                        disabled={isLoading}
                        severity="success"
                    />
                </div>
            </form>
        </div>
    );
}
