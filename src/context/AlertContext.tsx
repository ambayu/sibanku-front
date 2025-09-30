"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import AlertModal from "@/components/modals/AlertModal";

type AlertType = "success" | "error" | "warning" | "info";
interface AlertContextProps {
  showAlert: (type: AlertType, message: string) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<AlertType>("success");
  const [message, setMessage] = useState("");

  const showAlert = (t: AlertType, msg: string) => {
    setType(t);
    setMessage(msg);
    setVisible(true);

    // otomatis hilang setelah 2 detik
    setTimeout(() => setVisible(false), 2000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal
        visible={visible}
        type={type}
        message={message}
        onClose={() => setVisible(false)}
      />
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
};
