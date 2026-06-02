const StatusBadge = ({ status }) => {
  const styles = {
    Active:    'bg-green-100 text-green-700',
    Pending:   'bg-yellow-100 text-yellow-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Expired:   'bg-gray-100 text-gray-600',
    Cancelled: 'bg-red-100 text-red-600',
  };
  const icons = {
    Active:    <CheckCircle size={12} />,
    Pending:   <Clock size={12} />,
    Scheduled: <Calendar size={12} />,
    Expired:   <Ban size={12} />,
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