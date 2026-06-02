const Skeleton = ({
  className = '',
  rounded = 'rounded-xl',
}) => {
  return (
    <div
      className={`animate-pulse bg-[#ECE4DC] ${rounded} ${className}`}
    />
  );
};

export default Skeleton;