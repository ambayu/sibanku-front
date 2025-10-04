"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { useAlert } from "@/context/AlertContext";
import { create } from "./api"; // ⬅️ nanti kita buatkan api-nya
import { findAll as findAllRoles } from "../role/api"; // misal endpoint roles sudah ada

export default function UserForm() {
    const { showAlert } = useAlert();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ambil semua role untuk pilihan MultiSelect
    const { data: rolesData, isLoading: isLoadingRoles } = findAllRoles(1, 1000);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            name,
            email,
            username,
            password,
            roles: selectedRoles.map((r) => r.id), // kirim array id_role
        };

        try {
            await create(payload);
            showAlert("success", `User ${name} berhasil dibuat ✅`);
            setName("");
            setEmail("");
            setUsername("");
            setPassword("");
            setSelectedRoles([]);
        } catch (err: any) {
            showAlert("error", err.message || "Gagal membuat user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6  mx-auto bg-white shadow rounded-lg">

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

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        feedback={false}
                        toggleMask
                        className="w-full"
                        inputClassName="w-full"
                        required
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

                <div className="mt-4">
                    <Button
                        type="submit"
                        label={isLoading ? "Menyimpan..." : "Simpan"}
                        icon="pi pi-check"
                        severity="success"
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
            </form>
        </div>
    );
}
