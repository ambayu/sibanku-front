"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { useAlert } from "@/context/AlertContext";
import { findOne, update } from "./api";
import { findAll as findAllRoles } from "../role/api";

export default function UserEditForm() {
    const { showAlert } = useAlert();
    const router = useRouter();
    const params = useParams();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Ambil semua role
    const { data: rolesData, isLoading: isLoadingRoles } = findAllRoles(1, 1000);

    // Ambil data user berdasarkan id
    const { data: userData, isLoading: isLoadingUser } = findOne(Number(params.id));
    useEffect(() => {
        if (userData) {
            const user = userData;
            setName(user.name || "");
            setEmail(user.email || "");
            setUsername(user.username || "");
            setSelectedRoles(user.roles || []);
        }
    }, [userData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            name,
            email,
            username,
            password: password || undefined, // tidak wajib diisi
            roles: selectedRoles.map((r) => r.id),
        };

        try {
            await update(Number(params.id), payload);
            showAlert("success", `User ${name} berhasil diperbarui ✅`);
            router.push("/admin/users");
        } catch (err: any) {
            showAlert("error", err.message || "Gagal memperbarui user");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingUser) {
        return (
            <div className="p-6 text-center">
                <i className="pi pi-spin pi-spinner text-3xl text-gray-500"></i>
                <p>Memuat data user...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white shadow rounded-lg">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Nama */}
                <div>
                    <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                    <InputText
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama user"
                        className="w-full"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <InputText
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email user"
                        type="email"
                        className="w-full"
                        required
                    />
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <InputText
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="w-full"
                        required
                    />
                </div>

                {/* Password (opsional) */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Password (kosongkan jika tidak ingin diubah)
                    </label>
                    <Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        feedback={false}
                        toggleMask
                        className="w-full"
                        inputClassName="w-full"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium mb-2">Pilih Role</label>
                    <MultiSelect
                        value={selectedRoles}
                        options={rolesData?.data || []}
                        optionLabel="name"
                        placeholder={isLoadingRoles ? "Memuat role..." : "Pilih role"}
                        onChange={(e) => setSelectedRoles(e.value)}
                        display="chip"
                        className="w-full"
                    />
                </div>

                <div className="mt-6 flex justify-between">
                    <Button
                        label="Kembali"
                        icon="pi pi-arrow-left"
                        className="p-button-secondary"
                        onClick={() => router.push("/admin/users")}
                        type="button"
                    />
                    <Button
                        type="submit"
                        label={isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        icon="pi pi-save"
                        severity="success"
                        disabled={isLoading}
                    />
                </div>
            </form>
        </div>
    );
}
