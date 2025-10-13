"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.ok) {
      showAlert("success", "Login berhasil ✅, selamat datang 👋");
      setTimeout(() => router.push("/admin"), 1200);
    } else {
      console.log("🔍 Fetching:", `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
      showAlert("error", "Login gagal ❌, periksa username & password.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B5C4D] text-white relative overflow-hidden">
      {/* 🔹 Background hijau dan transparan */}
      <div className="absolute inset-0 bg-[#0B5C4D]/90"></div>

      {/* 🔹 Logo Pemko + Logo SIBANKUM di kiri atas */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
        <Image
          src="/images/logo-pemko.png"
          alt="Pemko Medan"
          width={55}
          height={55}
          className="drop-shadow-md"
        />
        <Image
          src="/images/logo-sibankum.png"
          alt="Logo SIBANKUM"
          width={160}
          height={55}
          className="drop-shadow-md"
        />
      </div>

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-4xl px-6">
        {/* Kiri */}
        <div className="flex-1 flex flex-col justify-center items-center text-center pr-0 lg:pr-8 mb-10 lg:mb-0">
          {/* 🔹 Foto Wali Kota di atas tulisan */}
          <div className="">
            <Image
              src="/images/pak-wali.png" // foto Wali Kota & Wakil Wali Kota
              alt="Wali Kota & Wakil Wali Kota Medan"
              width={380}
              height={160}
              className="rounded-md drop-shadow-md object-contain"
            />
          </div>

          {/* 🔹 Judul & Subjudul */}
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-wide ">
            SIBANKUM
          </h1>
          <p className="text-base lg:text-lg font-bold text-gray-200">
            Sistem Informasi Bantuan Hukum
          </p>

          {/* 🔹 Hashtag */}
          <div className="mt-3">
            <Image
              src="/images/hastag.png"
              alt="Kolaborasi Medan Berkah"
              width={400}
              height={55}
              className="drop-shadow-md"
            />
          </div>
        </div>

        {/* Garis Vertikal */}
        <div className="hidden lg:block w-px bg-white/40"></div>

        {/* Kanan - Form Login (tidak diubah) */}
        <div className="flex-1 flex flex-col justify-center items-center pl-0 lg:pl-8">
          <h2 className="text-xl lg:text-2xl font-medium mb-8">Login</h2>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 rounded-lg w-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-lg w-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-end text-white hover:text-orange-600 transition"
            >
              <span className="text-lg font-medium">
                {loading ? "Loading..." : "Go"}
              </span>
              {!loading && <ArrowRight className="h-5 w-5 ml-1" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
