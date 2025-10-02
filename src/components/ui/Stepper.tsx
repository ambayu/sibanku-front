"use client";

import React from "react";

type Step = {
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
};

export default function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-8 min-w-max px-2 mb-5">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={step.label}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => onStepChange?.(stepNumber)}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors
                  ${isActive ? "bg-[#0B5C4D] text-white border-[#0B5C4D]" : ""}
                  ${isCompleted ? "bg-[#0B5C4D] text-white border-[#0B5C4D]" : ""}
                  ${!isActive && !isCompleted ? "border-[#0B5C4D] text-[#0B5C4D]" : ""}
                `}
              >
                {stepNumber}
              </div>
              <p
                className={`mt-2 text-sm font-medium text-center w-max ${isActive ? "text-[#0B5C4D]" : "text-gray-600"
                  }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
