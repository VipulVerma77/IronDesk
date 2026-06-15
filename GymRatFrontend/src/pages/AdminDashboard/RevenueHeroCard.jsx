import { DollarSign } from "lucide-react";

const RevenueHeroCard = ({
  totalRevenue,
  monthlyRevenue,
  pendingRevenue,
}) => {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        bg-[#2A1F1A]
        text-white
        p-8
        min-h-[280px]

        shadow-sm
        hover:shadow-lg
        transition-all
        duration-300
      "
    >
      {/* Decorative Rings */}
      <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-white/10" />
      <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full border border-white/10" />

      {/* Icon */}
      <div
        className="
          absolute top-6 right-6
          w-14 h-14
          rounded-full
          bg-white/10
          flex items-center justify-center
        "
      >
        <DollarSign size={24} />
      </div>

      <div className="relative z-10">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          Total Revenue
        </p>

        <h1 className="mt-5 text-6xl lg:text-7xl font-black leading-none">
          ₹{totalRevenue?.toLocaleString()}
        </h1>

        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C4956A]" />
          <span className="text-sm text-white/80">
            Gym Revenue Overview
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">
              This Month
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹{monthlyRevenue?.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-[#C4956A]">
              ₹{pendingRevenue?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueHeroCard;