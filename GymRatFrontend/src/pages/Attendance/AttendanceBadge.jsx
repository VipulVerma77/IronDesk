import { CheckCircle, Clock } from 'lucide-react';

const AttendanceBadge = ({ checkOutTime }) => {
  if (!checkOutTime) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle size={12} />
        Inside
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <Clock size={12} />
      Checked Out
    </span>
  );
};

export default AttendanceBadge;