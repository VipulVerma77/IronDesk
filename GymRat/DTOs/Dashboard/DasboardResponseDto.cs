namespace GymRat.DTOs.Dashboard
{
    public class DashboardResponseDto
    {
        public MemberStatsDto MemberStats { get; set; } = new();
        public RevenueStatsDto RevenueStats { get; set; } = new();
        public AttendanceStatsDto AttendanceStats { get; set; } = new();
        public List<ExpiringSoonDto> ExpiringSoon { get; set; } = new();
        public List<RecentPaymentDto> RecentPayments { get; set; } = new();
        public List<NewMemberDto> NewMembers { get; set; } = new();
    }

    public class MemberStatsDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Inactive { get; set; }
        public int Blocked { get; set; }
    }

    public class RevenueStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public decimal PendingRevenue { get; set; }
    }

    public class AttendanceStatsDto
    {
        public int TodayCheckIns { get; set; }
        public int CurrentlyInside { get; set; }
    }

    public class ExpiringSoonDto
    {
        public int SubscriptionId { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public DateTime EndDate { get; set; }
        public int DaysLeft { get; set; }
    }

    public class RecentPaymentDto
    {
        public int PaymentId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
    }

    public class NewMemberDto
    {
        public int MemberId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }
    }
}