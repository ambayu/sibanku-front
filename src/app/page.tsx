"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";

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
      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } else {
      showAlert("error", "Login gagal ❌, periksa username & password.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B5C4D] text-white">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl px-6">
        {/* Kiri */}
        <div className="flex-1 flex flex-col justify-center items-center text-center pr-0 lg:pr-8 mb-10 lg:mb-0">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-wide">
            SIBANKUM
          </h1>
          <p className="text-base lg:text-lg text-gray-200">
            Sistem Informasi Bantuan Hukum
          </p>
        </div>

        {/* Garis */}
        <div className="hidden lg:block w-px bg-white/50"></div>

        {/* Kanan */}
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
              className="px-4 py-3 rounded-lg flex-1 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-lg justify-end text-white hover:text-orange-600 transition"
            >
              <span className="text-lg font-medium">
                {loading ? "Loading..." : "Go"}
              </span>
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
