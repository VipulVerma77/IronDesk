export const paymentStats = (data) => [
  {
    label: 'Total Payments',
    value: data?.totalCount ?? 0,
    icon: 'CreditCard',
    color: 'bg-[#1C1C1C]',
  },
  {
    label: 'Paid',
    value:
      data?.data?.filter((p) => p.status === 'Paid').length ?? 0,
    icon: 'CheckCircle',
    color: 'bg-green-500',
  },
  {
    label: 'Pending',
    value:
      data?.data?.filter((p) => p.status === 'Pending').length ?? 0,
    icon: 'Clock',
    color: 'bg-[#C4956A]',
  },
];