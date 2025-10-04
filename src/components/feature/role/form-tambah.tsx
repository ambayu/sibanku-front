"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAlert } from "@/context/AlertContext";
import { create } from "./api"; // endpoint create role kamu

export default function RoleForm() {
  const { showAlert } = useAlert();

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert("error", "Nama role tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    try {
      await create({ name });
      showAlert("success", `Role "${name}" berhasil dibuat ✅`);
      setName("");
    } catch (error: any) {
      showAlert("error", error.message || "Gagal membuat role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow ">
  

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input nama role */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            Nama Role
          </label>
          <InputText
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: user:create, banding:view"
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          label={isLoading ? "Menyimpan..." : "Simpan"}
          icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-save"}
          disabled={isLoading}
          severity="success"
        />
      </form>
    </div>
  );
}
