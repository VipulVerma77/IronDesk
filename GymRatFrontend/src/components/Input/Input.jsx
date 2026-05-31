const Input = ({
  label,
  error,
  icon,
  type = 'text',
  placeholder,
  registration,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#2A1F1A]">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          {...registration}
          {...props}
          className={`
            w-full rounded-xl border bg-white/60 backdrop-blur-sm
            px-4 py-3 text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B]
            outline-none transition-all duration-200
            focus:bg-white focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10
            ${icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
              : 'border-[#E0D8D0]'
            }
          `}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Input;