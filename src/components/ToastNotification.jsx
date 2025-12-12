import React, { useState, useEffect } from "react";
import { CheckCircle, Info, X } from "lucide-react";

const ToastNotification = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : "bg-blue-50 border-blue-200";
  const textColor = type === "success" ? "text-green-800" : "text-blue-800";
  const iconColor = type === "success" ? "text-green-600" : "text-blue-600";

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${bgColor} animate-slide-in`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconColor}`}>
          {type === "success" ? <CheckCircle size={20} /> : <Info size={20} />}
        </div>
        <span className={`font-medium ${textColor}`}>{message}</span>
        <button
          onClick={onClose}
          className={`ml-4 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
