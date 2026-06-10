import { Calendar } from 'lucide-react';

const AttendanceFilters = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  handleRangeSearch,
  rangeError,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B6B6B]">
          From Date
        </label>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[#ECE4DC] bg-white text-sm text-[#2A1F1A] outline-none focus:border-[#1C1C1C] transition-all cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B6B6B]">
          To Date
        </label>

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[#ECE4DC] bg-white text-sm text-[#2A1F1A] outline-none focus:border-[#1C1C1C] transition-all cursor-pointer"
        />
      </div>

      <button
        onClick={handleRangeSearch}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1C1C] text-white rounded-xl text-sm font-medium hover:bg-[#333] transition-colors cursor-pointer"
      >
        <Calendar size={16} />
        Search
      </button>

      {rangeError && (
        <p className="text-sm text-red-500">
          ⚠ {rangeError}
        </p>
      )}
    </div>
  );
};

export default AttendanceFilters;