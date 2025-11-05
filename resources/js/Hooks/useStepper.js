import { useState } from "react";

export default function useStepper(totalSteps = 1) {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    };

    const previousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const goToStep = (step) => {
        if (step >= 0 && step < totalSteps) {
            setCurrentStep(step);
        }
    };

    const reset = () => {
        setCurrentStep(0);
    };

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return {
        currentStep,
        nextStep,
        previousStep,
        goToStep,
        reset,
        isFirstStep,
        isLastStep,
    };
}
