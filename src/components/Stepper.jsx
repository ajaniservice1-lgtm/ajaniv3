// src/components/Stepper.jsx
import React from "react";
import { CheckCircle, CreditCard, Check, Calendar, Users } from "lucide-react";

const Stepper = ({ currentStep, type = "hotel" }) => {
  // Define steps based on booking type
  const getSteps = () => {
    switch(type) {
      case "hotel":
        return [
          { id: 1, label: "Customer Information", icon: Users },
          { id: 2, label: "Payment Information", icon: CreditCard },
          { id: 3, label: "Booking is Confirmed", icon: Check },
        ];
      case "restaurant":
        return [
          { id: 1, label: "Booking Details", icon: Calendar },
          { id: 2, label: "Booking Confirmed", icon: Check },
        ];
      case "shortlet":
        return [
          { id: 1, label: "Booking Details", icon: Calendar },
          { id: 2, label: "Booking Confirmed", icon: Check },
        ];
      default:
        return [
          { id: 1, label: "Customer Information", icon: Users },
          { id: 2, label: "Payment Information", icon: CreditCard },
          { id: 3, label: "Booking is Confirmed", icon: Check },
        ];
    }
  };

  const steps = getSteps();

  return (
    <div className="w-full mb-10 flex items-center justify-between relative">
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200">
        <div
          className="h-[2px] bg-emerald-500 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center text-center w-full"
          >
            {/* Icon Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isActive
                    ? "bg-white border-emerald-500 text-emerald-500"
                    : "bg-white border-gray-300 text-gray-400"
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <p
              className={`mt-2 text-xs font-medium
                ${
                  isCompleted || isActive
                    ? "text-emerald-600"
                    : "text-gray-400"
                }
              `}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;