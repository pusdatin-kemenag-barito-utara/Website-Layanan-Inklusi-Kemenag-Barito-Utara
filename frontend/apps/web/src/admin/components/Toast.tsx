import { CheckCircle, AlertCircle } from "lucide-react";

export type ToastProps = {
  msg: string;
  type: "success" | "error";
};

export default function Toast({ toast }: { toast: ToastProps }) {
  const isSuccess = toast.type === "success";

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: isSuccess ? "#ecfdf5" : "#fef2f2",
        border: `1px solid ${isSuccess ? "#a7f3d0" : "#fecaca"}`,
        color: isSuccess ? "#065f46" : "#b91c1c",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{toast.msg}</span>
    </div>
  );
}
