import { CheckCircle, Clock, X } from "lucide-react";

const StatusBadge = ({ status }) => {
  const styles = {
    Paid:      'bg-green-100 text-green-700',
    Pending:   'bg-yellow-100 text-yellow-700',
    Cancelled: 'bg-red-100 text-red-600',
  };
  const icons = {
    Paid:      <CheckCircle size={12} />,
    Pending:   <Clock size={12} />,
    Cancelled: <X size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Pending}`}>
      {icons[status]}
      {status}
    </span>
  );
};
export default StatusBadge;