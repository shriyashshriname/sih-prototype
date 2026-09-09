import React from 'react';

const STEPS = [
  { id: 1, label: 'Select Habitation' },
  { id: 2, label: 'Assess Risk' },
  { id: 3, label: 'Find Sites' },
  { id: 4, label: 'Compare' },
  { id: 5, label: 'Plan' },
  { id: 6, label: 'Review & Authority' },
];

export default function RelocationStepper({ currentStep, onStepClick, maxAllowedStep = 6 }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex-shrink-0">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isAccessible = step.id <= maxAllowedStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isAccessible && onStepClick && onStepClick(step.id)}
                disabled={!isAccessible}
                className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-blue-600'
                    : isCompleted
                    ? 'text-emerald-700 hover:text-emerald-800'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.id}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">{step.label}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 mx-2 h-0.5 max-w-[48px] rounded transition-all ${
                    step.id < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
