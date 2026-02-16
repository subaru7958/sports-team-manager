import React from 'react';

const Button = ({
    children,
    onClick,
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
    icon = null,
    ...props
}) => {
    const baseStyles = "font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary hover:bg-blue-700 text-white shadow-primary/20 hover:shadow-primary/40",
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-slate-100/20",
        ghost: "bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-900 shadow-none"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-inherit"></div>
            ) : (
                <>
                    {children}
                    {icon && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">{icon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
