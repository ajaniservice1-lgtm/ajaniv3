import React from "react";
import { Users, CreditCard, CheckCircle } from "phosphor-react";

const PRIMARY = "#6cff";

const Stepper = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, label: "Customer\nInformation", icon: Users },
    { id: 2, label: "Payment\nInformation", icon: CreditCard },
    { id: 3, label: "Booking is\nConfirmed", icon: CheckCircle },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center max-w-3xl px-4 gap-3 sm:gap-4 lg:gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center min-w-[88px]">
                <div className="relative">
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full border-2 opacity-60"
                      style={{ borderColor: PRIMARY }}
                    />
                  )}

                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-100"
                    style={{
                      backgroundColor: isCompleted ? PRIMARY : "#F3F4F6",
                      color: isCompleted
                        ? "white"
                        : isActive
                        ? PRIMARY
                        : "#9CA3AF",
                    }}
                  >
                    <Icon size={21} weight={isCompleted ? "fill" : "regular"} />
                  </div>
                </div>

                <p
                  className={`mt-2 text-xs font-medium whitespace-pre-line
                    ${
                      isActive || isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector */}
              {index !== steps.length - 1 && (
                <div className="flex items-center">
                  <div
                    className="
                      h-[2px]
                      w-10 sm:w-14 md:w-20
                      border-t
                      border-solid md:border-dashed
                    "
                    style={{
                      borderColor:
                        currentStep > step.id
                          ? "rgba(108, 255, 0, 0.35)"
                          : "rgba(209, 213, 219, 0.7)",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
