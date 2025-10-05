"use client";

import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Skeleton } from "primereact/skeleton";
import { useSession } from "next-auth/react";
import { useAlert } from "@/context/AlertContext";
import { findOne, update } from "./api";
import {
    create as createBiodata,
    update as updateBiodata,
} from "../biodata/api";

export default function ProfilePage() {
    const { showAlert } = useAlert();
    const { data: session } = useSession();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // modal visibility
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditBiodata, setShowEditBiodata] = useState(false);

    // form states
    const [formProfile, setFormProfile] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
    });

    const [formBiodata, setFormBiodata] = useState({
        alamat: "",
        no_telp: "",
        kota: "",
        kode_pos: "",
        jenis_kelamin: "",
        jabatan: "",
        pangkat: "",
        photo: null as File | string | null,
    });

    // ambil user
    const { data: userData, refresh } = findOne(Number(session?.user?.id));

    useEffect(() => {
        if (userData) {
            setUser(userData);
            setLoading(false);
            setFormProfile({
                name: userData.name || "",
                email: userData.email || "",
                username: userData.username || "",
                password: "",
            });
            setFormBiodata({
                alamat: userData.biodata?.alamat || "",
                no_telp: userData.biodata?.no_telp || "",
                kota: userData.biodata?.kota || "",
                kode_pos: userData.biodata?.kode_pos || "",
                jenis_kelamin: userData.biodata?.jenis_kelamin || "",
                jabatan: userData.biodata?.jabatan || "",
                pangkat: userData.biodata?.pangkat || "",
                photo: userData.biodata?.photo || null,
            });
        }
    }, [userData]);

    // 🔹 Update Profile
    const handleUpdateProfile = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const payload = {
                name: formProfile.name,
                email: formProfile.email,
                username: formProfile.username,
                password: formProfile.password || undefined,
            };
            await update(user.id, payload);
            showAlert("success", "Profil berhasil diperbarui");
            setUser({ ...user, ...payload });
            setShowEditProfile(false);
            refresh();
        } catch (err: any) {
            showAlert("error", err.message || "Gagal memperbarui profil");
        } finally {
            setSaving(false);
            setFormProfile({ ...formProfile, password: "" });
        }
    };

    // 🔹 Create / Update Biodata pakai FormData
    const handleSaveBiodata = async () => {
        if (!user?.id) return showAlert("error", "User belum terdeteksi!");
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("id_user", user.id.toString());
            formData.append("alamat", formBiodata.alamat || "");
            formData.append("no_telp", formBiodata.no_telp || "");
            formData.append("kota", formBiodata.kota || "");
            formData.append("kode_pos", formBiodata.kode_pos || "");
            formData.append("jenis_kelamin", formBiodata.jenis_kelamin || "");
            formData.append("jabatan", formBiodata.jabatan || "");
            formData.append("pangkat", formBiodata.pangkat || "");
            if (formBiodata.photo instanceof File) {
                formData.append("photo", formBiodata.photo);
            }

            if (user?.biodata?.id) {
                // UPDATE
                await updateBiodata(user.biodata.id, formData);
                refresh();
                showAlert("success", "Biodata berhasil diperbarui");
            } else {
                // CREATE
                await createBiodata(formData);
                refresh();
                showAlert("success", "Biodata berhasil dibuat");
            }

            setShowEditBiodata(false);
            refresh();
        } catch (err: any) {
            showAlert("error", err.message || "Gagal menyimpan biodata");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className="p-6">
                <Skeleton width="100%" height="250px" className="mb-4" />
                <Skeleton width="100%" height="200px" />
            </div>
        );

    const biodata = user?.biodata || {};

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Profile Saya</h1>
                    <p className="text-gray-600">Kelola informasi profil Anda</p>
                </div>

                {/* Informasi Akun & Foto Profil - DIGABUNG */}
                <Card className="shadow-sm border mb-6">
                    <div className="flex flex-col md:flex-row gap-15">
                        {/* Foto Profil */}
                        <div className="flex-shrink-0">
                            <div className="text-center">
                                {biodata?.photo ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/photo/${biodata.photo}`}
                                        className="w-32 h-32 rounded-full mx-auto mb-4 border"
                                        alt="Profile Photo"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 border">
                                        <span className="text-gray-500 text-lg">Foto</span>
                                    </div>
                                )}

                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium inline-block">
                                    {user?.roles?.map((r: any) => r.name).join(", ") || "User"}
                                </div>
                            </div>
                        </div>

                        {/* Informasi Akun */}
                        <div className="flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                                    <p className="text-gray-800 text-lg font-semibold">{user?.name || "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="text-gray-800">{user?.email || "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                    <p className="text-gray-800">{user?.username || "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                    <p className="text-gray-800">
                                        {user?.roles?.map((r: any) => r.name).join(", ") || "User"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <Button
                                    label="Edit Profil"
                                    icon="pi pi-pencil"
                                    onClick={() => setShowEditProfile(true)}
                                    className="p-button-sm p-button-outlined"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Informasi Biodata */}
                <Card className="shadow-sm border" title="Informasi Biodata">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Alamat</label>
                                <p className="text-gray-800">{biodata.alamat || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">No Telp</label>
                                <p className="text-gray-800">{biodata.no_telp || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kota</label>
                                <p className="text-gray-800">{biodata.kota || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kode Pos</label>
                                <p className="text-gray-800">{biodata.kode_pos || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                                <p className="text-gray-800">{biodata.jenis_kelamin || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Jabatan</label>
                                <p className="text-gray-800">{biodata.jabatan || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Pangkat</label>
                                <p className="text-gray-800">{biodata.pangkat || "-"}</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                label={biodata?.id ? "Edit Biodata" : "Tambah Biodata"}
                                icon="pi pi-user-edit"
                                onClick={() => setShowEditBiodata(true)}
                                className="p-button-sm p-button-outlined"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* === Modal Edit Profile === */}
            <Dialog
                header="Edit Profil"
                visible={showEditProfile}
                style={{ width: "500px" }}
                modal
                onHide={() => setShowEditProfile(false)}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        <InputText
                            value={formProfile.name}
                            onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                            className="w-full"
                            placeholder="Masukkan nama lengkap"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <InputText
                            value={formProfile.email}
                            onChange={(e) => setFormProfile({ ...formProfile, email: e.target.value })}
                            className="w-full"
                            placeholder="Masukkan email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <InputText
                            value={formProfile.username}
                            onChange={(e) => setFormProfile({ ...formProfile, username: e.target.value })}
                            className="w-full"
                            placeholder="Masukkan username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru (opsional)</label>
                        <Password
                            value={formProfile.password}
                            onChange={(e) => setFormProfile({ ...formProfile, password: e.target.value })}
                            placeholder="Masukkan password baru"
                            toggleMask
                            feedback={false}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <Button
                            label="Batal"
                            severity="secondary"
                            onClick={() => setShowEditProfile(false)}
                            className="p-button-outlined p-button-sm"
                        />
                        <Button
                            label="Simpan"
                            onClick={handleUpdateProfile}
                            loading={saving}
                            severity="success"
                            className="p-button-sm"
                        />
                    </div>
                </div>
            </Dialog>

            {/* === Modal Biodata === */}
            <Dialog
                header={biodata?.id ? "Edit Biodata" : "Tambah Biodata"}
                visible={showEditBiodata}
                style={{ width: "600px" }}
                modal
                onHide={() => setShowEditBiodata(false)}
            >
                <div className="space-y-4">
                    {/* Foto Profil */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto Profil</label>
                        <div className="flex items-center gap-4">
                            {formBiodata.photo && (
                                <img
                                    src={
                                        formBiodata.photo instanceof File
                                            ? URL.createObjectURL(formBiodata.photo)
                                            : `${process.env.NEXT_PUBLIC_API_URL}/uploads/photos/${formBiodata.photo}`
                                    }
                                    className="w-16 h-16 object-cover rounded border"
                                    alt="Preview"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormBiodata({
                                        ...formBiodata,
                                        photo: e.target.files?.[0] || null,
                                    })
                                }
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Alamat", field: "alamat" },
                            { label: "No Telepon", field: "no_telp" },
                            { label: "Kota", field: "kota" },
                            { label: "Kode Pos", field: "kode_pos" },
                            { label: "Jenis Kelamin", field: "jenis_kelamin" },
                            { label: "Jabatan", field: "jabatan" },
                            { label: "Pangkat", field: "pangkat" },
                        ].map((item) => (
                            <div key={item.field} className={item.field === "alamat" ? "col-span-2" : ""}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {item.label}
                                </label>
                                <InputText
                                    placeholder={`Masukkan ${item.label.toLowerCase()}`}
                                    value={(formBiodata as any)[item.field]}
                                    onChange={(e) =>
                                        setFormBiodata({
                                            ...formBiodata,
                                            [item.field]: e.target.value,
                                        })
                                    }
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <Button
                            label="Batal"
                            severity="secondary"
                            onClick={() => setShowEditBiodata(false)}
                            className="p-button-outlined p-button-sm"
                        />
                        <Button
                            label="Simpan"
                            onClick={handleSaveBiodata}
                            loading={saving}
                            severity="success"
                            className="p-button-sm"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}