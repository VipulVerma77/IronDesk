import { CalendarCheck, Users } from 'lucide-react';

const AttendanceStats = ({ todayData }) => {
  const stats = [
    {
      label: "Today's Total",
      value: todayData?.totalCount ?? '—',
      icon: CalendarCheck,
      color: 'bg-[#1C1C1C]',
    },
    {
      label: 'Currently Inside',
      value:
        todayData?.data?.filter((record) => !record.checkOutTime).length ??
        '—',
      icon: Users,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-[#ECE4DC] shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}
            >
              <Icon size={20} className="text-white" />
            </div>

            <div>
              <p className="text-xs text-[#6B6B6B]">{stat.label}</p>

              <p
                className="text-2xl font-black text-[#2A1F1A]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStats;