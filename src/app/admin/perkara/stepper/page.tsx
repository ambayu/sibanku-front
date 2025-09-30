"use client";

import { useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { UploadCloud } from "lucide-react";

export default function ContohStepper() {
    const steps = [
        { label: "Relas" },
        { label: "Resume" },
        { label: "Legalitas" },
        { label: "Catatan Sidang" },
        { label: "Jawaban" },
        { label: "Replik" },
        { label: "Duplik" },
        { label: "Bukti" },
        { label: "Kesimpulan" },
    ];

    const [currentStep, setCurrentStep] = useState(1);

    return (
        <div className="p-6 bg-[#FFFCF0] min-h-screen rounded-xl">
            <h1 className="text-2xl font-bold mb-8 text-center">Tahap Persidangan</h1>

            {/* Stepper */}
            <Stepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />

            <div className="relative w-full h-1 bg-gray-200 rounded my-6">
                <div
                    className="absolute top-0 left-0 h-1 bg-[#0B5C4D] rounded transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
            </div>

            {/* Konten Step */}
            {currentStep === 1 && (
                <div>
                    <h2 className="text-lg font-bold mb-2">Lorem Ipsum</h2>
                    <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet</p>

                    {/* Upload Box */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white text-gray-500 hover:border-[#0B5C4D] transition">
                        <UploadCloud className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="font-medium">Upload Files</p>
                        <p className="text-sm">Or Drag & Drop Here</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition">
                            Batal
                        </button>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="px-6 py-2 rounded-lg bg-orange-400 text-white hover:bg-orange-500 transition"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div>
                    <h2 className="text-lg font-bold mb-2">Resume</h2>
                    <p className="text-gray-600 mb-6">Isi form resume di sini...</p>
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
    );
}
