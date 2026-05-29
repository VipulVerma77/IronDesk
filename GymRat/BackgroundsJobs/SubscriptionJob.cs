using GymRat.Data;
using Microsoft.EntityFrameworkCore;

namespace GymRat.BackgroundJobs
{
    // App starts
// → .NET sees AddHostedService, starts SubscriptionJob automatically

// ExecuteAsync runs:
// → while app is running:
//     → call ProcessSubscriptionsAsync()
//     → wait 24 hours
//     → repeat

// ProcessSubscriptionsAsync:
// → create fresh DbContext
// → find Scheduled subs where StartDate arrived → make Active
// → find Active subs where EndDate passed → make Expired
// → save
// → log what happened
    public class SubscriptionJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubscriptionJob> _logger;

        // Run every 24 hours
        private readonly TimeSpan _interval = TimeSpan.FromHours(24);

        public SubscriptionJob(IServiceScopeFactory scopeFactory, ILogger<SubscriptionJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SubscriptionJob started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessSubscriptionsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "SubscriptionJob failed.");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }

        private async Task ProcessSubscriptionsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var today = DateTime.UtcNow.Date;

            // ─────────────────────────────────────────────
            // 1. Scheduled → Active
            //    Payment is done, StartDate has arrived
            // ─────────────────────────────────────────────
            var scheduledSubs = await context.MemberSubscriptions
                .Include(s => s.Member)
                .Where(s => s.Status == "Scheduled" && s.StartDate.Date <= today)
                .ToListAsync();

            foreach (var sub in scheduledSubs)
            {
                sub.Status = "Active";
                sub.Member.Status = "Active";
                _logger.LogInformation(
                    "Subscription {SubId} activated. Member {MemberId} is now Active.",
                    sub.Id, sub.MemberId);
            }

            // ─────────────────────────────────────────────
            // 2. Active → Expired
            //    EndDate has passed
            // ─────────────────────────────────────────────
            var expiredSubs = await context.MemberSubscriptions
                .Include(s => s.Member)
                .Where(s => s.Status == "Active" && s.EndDate.Date < today)
                .ToListAsync();

            foreach (var sub in expiredSubs)
            {
                sub.Status = "Expired";

                // Only deactivate member if they have no other Active subscription
                var hasOtherActive = await context.MemberSubscriptions
                    .AnyAsync(s => s.MemberId == sub.MemberId
                                && s.Status == "Active"
                                && s.Id != sub.Id);

                if (!hasOtherActive)
                {
                    sub.Member.Status = "Inactive";
                    _logger.LogInformation(
                        "Subscription {SubId} expired. Member {MemberId} set to Inactive.",
                        sub.Id, sub.MemberId);
                }
                else
                {
                    _logger.LogInformation(
                        "Subscription {SubId} expired. Member {MemberId} has another active sub, stays Active.",
                        sub.Id, sub.MemberId);
                }
            }

            if (scheduledSubs.Count > 0 || expiredSubs.Count > 0)
                await context.SaveChangesAsync();

            _logger.LogInformation(
                "SubscriptionJob done. Activated: {A}, Expired: {E}",
                scheduledSubs.Count, expiredSubs.Count);
        }
    }
}