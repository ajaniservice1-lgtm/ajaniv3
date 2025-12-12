import { useState, useCallback } from "react";
import { CheckCircle, Info, X } from "lucide-react";

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = Date.now();
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg border animate-slide-in ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={
                toast.type === "success" ? "text-green-600" : "text-blue-600"
              }
            >
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-4 ${
                toast.type === "success" ? "text-green-800" : "text-blue-800"
              } hover:opacity-70 transition-opacity`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
};

export default useToast;
