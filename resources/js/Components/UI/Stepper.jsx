import React from "react";

export default function Stepper({ steps, currentStep }) {
    return (
        <div className="w-full py-6 px-2">
            {/* Desktop View */}
            <div className="hidden sm:flex items-center justify-center">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                                    relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm transition-all duration-300
                                    ${
                                        index < currentStep
                                            ? "bg-green-500 text-white shadow-lg scale-110"
                                            : index === currentStep
                                            ? "bg-black text-white shadow-xl scale-125 ring-4 ring-gray-400"
                                            : "bg-gray-200 text-gray-500"
                                    }
                                `}
                            >
                                {index < currentStep ? (
                                    // Checkmark for completed steps
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    // Step number
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            {/* Step Label */}
                            <span
                                className={`
                                    mt-2 text-xs font-medium text-center
                                    ${
                                        index === currentStep
                                            ? "text-black font-bold"
                                            : index < currentStep
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }
                                `}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex items-center mx-2">
                                <div
                                    className={`
                                        h-1 w-12 sm:w-20 md:w-24 transition-all duration-500
                                        ${
                                            index < currentStep
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                        }
                                    `}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile View - Compact Horizontal Stepper */}
            <div className="sm:hidden">
                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                        <div
                            style={{
                                width: `${
                                    (currentStep / (steps.length - 1)) * 100
                                }%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black transition-all duration-500"
                        ></div>
                    </div>
                </div>

                {/* Compact Steps */}
                <div className="flex items-center justify-between px-1">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center flex-1"
                        >
                            <div
                                className={`
                                    relative flex items-center justify-center rounded-full font-bold transition-all duration-300
                                    ${
                                        index === currentStep
                                            ? "w-10 h-10 text-sm bg-black text-white shadow-lg ring-2 ring-gray-400"
                                            : index < currentStep
                                            ? "w-8 h-8 text-xs bg-green-500 text-white shadow-md"
                                            : "w-8 h-8 text-xs bg-gray-200 text-gray-500"
                                    }
                                `}
                            >
                                {index < currentStep ? (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            {/* Only show label for current step on mobile */}
                            {index === currentStep && (
                                <span className="mt-2 text-xs font-bold text-black text-center">
                                    {step.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Description */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Paso {currentStep + 1} de {steps.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
