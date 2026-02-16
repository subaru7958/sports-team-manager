import React from 'react';

const ProgressBar = ({ step, totalSteps = 3, title, subtext }) => {
    const percentage = (step / totalSteps) * 100;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-6 justify-between items-end">
                <p className="text-slate-900 text-base font-medium leading-normal">
                    {title}
                </p>
                <p className="text-slate-500 text-sm font-normal leading-normal">
                    Step {step} of {totalSteps}
                </p>
            </div>
            <div className="rounded-full bg-slate-100 h-2 w-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {subtext && (
                <p className="text-slate-500 text-sm font-normal leading-normal">
                    {subtext}
                </p>
            )}
        </div>
    );
};

export default ProgressBar;
