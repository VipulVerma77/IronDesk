const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = ({
  children,
  onClick,
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  disabled  = false,
  isLoading = false,
  type     = 'button',
}) => {

  const base = 'font-medium rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2';

  const variants = {
    primary:   'bg-[#1C1C1C] text-white hover:bg-[#333333]',
    secondary: 'bg-transparent border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white',
    accent:    'bg-[#C4956A] text-white hover:bg-[#b08050]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-12 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;