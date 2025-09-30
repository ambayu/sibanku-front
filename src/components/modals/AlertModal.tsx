"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ReactNode, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"; // pakai lucide-react icon

interface AlertModalProps {
    visible: boolean;
    type?: "success" | "error" | "warning" | "info";
    title?: string;
    message: string | ReactNode;
    onClose: () => void;
    autoClose?: boolean;
    autoCloseTime?: number;
}

export default function AlertModal({
    visible,
    type = "info",
    title,
    message,
    onClose,
    autoClose = false,
    autoCloseTime = 1500,
}: AlertModalProps) {
    // warna sesuai type
    const color =
        type === "success"
            ? "bg-green-600"
            : type === "error"
            ? "bg-red-600"
            : type === "warning"
            ? "bg-yellow-500"
            : "bg-blue-600";

    const icon =
        type === "success" ? <CheckCircle className="text-green-600 w-6 h-6" /> :
        type === "error"   ? <XCircle className="text-red-600 w-6 h-6" /> :
        type === "warning" ? <AlertCircle className="text-yellow-500 w-6 h-6" /> :
                             <Info className="text-blue-600 w-6 h-6" />;

    // auto close pakai useEffect biar gak ngerender ulang terus
    useEffect(() => {
        if (visible && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [visible, autoClose, autoCloseTime, onClose]);

    return (
        <Dialog
            header={
                <div className="flex items-center gap-2">
                    {icon}
                    <span>
                        {title || type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                </div>
            }
            visible={visible}
            onHide={onClose}
            style={{ width: "450px" }}
            closable={!autoClose}
            footer={
                !autoClose && (
                    <div className="flex justify-end">
                        <Button
                            label="Tutup"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${color} hover:opacity-90 text-white`}
                        />
                    </div>
                )
            }
        >
            <div className="flex items-start gap-3">
                {icon}
                <div className="text-gray-700">{message}</div>
            </div>
        </Dialog>
    );
}
