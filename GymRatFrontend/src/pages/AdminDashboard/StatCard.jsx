import React from "react";

const StatCard = React.memo(
  ({
    title,
    value,
    icon: Icon,
    color = "bg-[#C4956A]",
    loading = false,
  }) => {
    return (
      <div
        className="
          bg-white
          border border-[#ECE4DC]
          rounded-3xl
          p-6

          shadow-sm
          hover:shadow-md
          hover:-translate-y-1

          transition-all
          duration-300
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B6B6B]">
              {title}
            </p>

            {loading ? (
              <div className="h-12 w-24 mt-3 rounded bg-[#ECE4DC] animate-pulse" />
            ) : (
              <h2 className="mt-3 text-5xl font-black text-[#2A1F1A] leading-none">
                {value}
              </h2>
            )}
          </div>

          <div
            className={`
              w-12 h-12
              rounded-2xl
              flex items-center justify-center
              ${color}
            `}
          >
            <Icon
              size={20}
              className="text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C4956A]" />

          <span className="text-xs text-[#6B6B6B]">
            Updated today
          </span>
        </div>
      </div>
    );
  }
);

export default StatCard;