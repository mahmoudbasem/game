import React from 'react';

export type Step = 'gameSelection' | 'accountInfo' | 'payment' | 'confirmation';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps = [
  { id: 'gameSelection', label: 'اختيار اللعبة', icon: 'gamepad' },
  { id: 'accountInfo', label: 'بيانات الحساب', icon: 'user' },
  { id: 'payment', label: 'الدفع', icon: 'credit-card' },
  { id: 'confirmation', label: 'التأكيد', icon: 'check' }
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'gamepad':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'check':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div 
              className={`step-indicator w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                getStepStatus(step.id) === 'completed' 
                  ? 'bg-primary border-primary text-white' 
                  : getStepStatus(step.id) === 'active'
                    ? 'border-primary text-primary'
                    : 'border-gray-300 text-gray-500'
              }`}
            >
              {getIcon(step.icon)}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={`h-1 flex-1 mx-2 ${
                getStepStatus(steps[index + 1].id) === 'inactive' 
                  ? 'bg-gray-200' 
                  : 'bg-primary'
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
