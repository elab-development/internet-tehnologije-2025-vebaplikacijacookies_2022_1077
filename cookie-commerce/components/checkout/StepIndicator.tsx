import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const stepNumber = index + 1;

          return (
            <div key={step} className="flex items-center">
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold transition-all duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-white border-gray-300 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className={`absolute top-12 w-32 text-center text-xs font-medium uppercase ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
