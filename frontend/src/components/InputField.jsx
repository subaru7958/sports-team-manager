import React from 'react';

const InputField = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    error = "",
    className = "",
    required = false,
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-slate-900 text-sm font-bold uppercase tracking-wider">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`form-input text-lg font-medium px-6 py-4 rounded-xl border-2 transition-all outline-none
                    ${error ? "border-red-200 bg-red-50 focus:border-red-400" : "border-slate-100 bg-white focus:border-primary/50 focus:bg-slate-50"}
                `}
                style={{ height: "64px" }}
                {...props}
            />
            {error && <p className="text-red-500 text-xs font-semibold ml-1">{error}</p>}
        </div>
    );
};

export default InputField;
