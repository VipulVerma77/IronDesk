using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Dashboard;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<DashboardResponseDto>> GetSummaryAsync(int gymId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var sevenDaysLater = today.AddDays(7);

            // ─────────────────────────────────────────
            // 1. MEMBER STATS
            // ─────────────────────────────────────────
            var members = await _context.Members
                .Where(m => m.GymId == gymId)
                .GroupBy(m => m.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var memberStats = new MemberStatsDto
            {
                Total = members.Sum(m => m.Count),
                Active = members.FirstOrDefault(m => m.Status == "Active")?.Count ?? 0,
                Inactive = members.FirstOrDefault(m => m.Status == "Inactive")?.Count ?? 0,
                Blocked = members.FirstOrDefault(m => m.Status == "Blocked")?.Count ?? 0
            };

            // ─────────────────────────────────────────
            // 2. REVENUE STATS
            // ─────────────────────────────────────────
            var payments = await _context.Payments
                .Where(p => p.GymId == gymId)
                .ToListAsync();

            var revenueStats = new RevenueStatsDto
            {
                TotalRevenue = payments
                    .Where(p => p.Status == "Paid")
                    .Sum(p => p.Amount),

                ThisMonthRevenue = payments
                    .Where(p => p.Status == "Paid" && p.PaidAt >= startOfMonth)
                    .Sum(p => p.Amount),

                PendingRevenue = payments
                    .Where(p => p.Status == "Pending")
                    .Sum(p => p.Amount)
            };

            // ─────────────────────────────────────────
            // 3. ATTENDANCE STATS
            // ─────────────────────────────────────────
            var todayAttendance = await _context.Attendances
                .Where(a => a.GymId == gymId && a.Date == today)
                .ToListAsync();

            var attendanceStats = new AttendanceStatsDto
            {
                TodayCheckIns = todayAttendance.Count,
                CurrentlyInside = todayAttendance.Count(a => a.CheckOutTime == null)
            };

            // ─────────────────────────────────────────
            // 4. EXPIRING SOON (next 7 days)
            // ─────────────────────────────────────────
            var expiringSoon = await _context.MemberSubscriptions
                .Include(s => s.Member)
                .Include(s => s.MembershipPlan)
                .Where(s => s.GymId == gymId
                         && s.Status == "Active"
                         && s.EndDate.Date >= today.ToDateTime(TimeOnly.MinValue)
                         && s.EndDate.Date <= sevenDaysLater.ToDateTime(TimeOnly.MinValue))
                .OrderBy(s => s.EndDate)
                .Take(10)
                .ToListAsync();

            var expiringSoonList = expiringSoon.Select(s => new ExpiringSoonDto
            {
                SubscriptionId = s.Id,
                MemberId = s.MemberId,
                MemberName = s.Member.FullName,
                PlanName = s.MembershipPlan.Name,
                EndDate = s.EndDate,
                DaysLeft = (s.EndDate.Date - DateTime.UtcNow.Date).Days
            }).ToList();

            // ─────────────────────────────────────────
            // 5. RECENT PAYMENTS (last 5)
            // ─────────────────────────────────────────
            var recentPayments = await _context.Payments
                .Include(p => p.MemberSubscription)
                    .ThenInclude(ms => ms.Member)
                .Include(p => p.MemberSubscription)
                    .ThenInclude(ms => ms.MembershipPlan)
                .Where(p => p.GymId == gymId && p.Status == "Paid")
                .OrderByDescending(p => p.PaidAt)
                .Take(5)
                .ToListAsync();

            var recentPaymentList = recentPayments.Select(p => new RecentPaymentDto
            {
                PaymentId = p.Id,
                MemberName = p.MemberSubscription.Member.FullName,
                Amount = p.Amount,
                PlanName = p.MemberSubscription.MembershipPlan.Name,
                PaidAt = p.PaidAt ?? DateTime.UtcNow
            }).ToList();

            // ─────────────────────────────────────────
            // 6. NEW MEMBERS (last 7 days)
            // ─────────────────────────────────────────
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var newMembers = await _context.Members
                .Where(m => m.GymId == gymId && m.JoinDate >= sevenDaysAgo)
                .OrderByDescending(m => m.JoinDate)
                .Take(5)
                .Select(m => new NewMemberDto
                {
                    MemberId = m.Id,
                    FullName = m.FullName,
                    Email = m.Email,
                    Phone = m.Phone,
                    JoinDate = m.JoinDate
                })
                .ToListAsync();

            // ─────────────────────────────────────────
            // ASSEMBLE
            // ─────────────────────────────────────────
            var dashboard = new DashboardResponseDto
            {
                MemberStats = memberStats,
                RevenueStats = revenueStats,
                AttendanceStats = attendanceStats,
                ExpiringSoon = expiringSoonList,
                RecentPayments = recentPaymentList,
                NewMembers = newMembers
            };

            return ApiResponse<DashboardResponseDto>.Success("Dashboard fetched", dashboard);
        }
    }
}