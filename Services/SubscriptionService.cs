using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Subscription;
using GymRat.Models;
using GymRat.Services.Interfaces;
using GymRat.Services.Helper;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public SubscriptionService(AppDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        private static string DetermineInitialStatus(DateTime startDate)
        {
            // Before payment: always Pending regardless of StartDate
            // StartDate is stored so PaymentService can determine Active vs Scheduled on payment
            return "Pending";
        }

        private SubscriptionResponseDto MapToSubscriptionDto(MemberSubscription s)
        {
            return new SubscriptionResponseDto
            {
                Id = s.Id,
                MemberId = s.MemberId,
                MemberName = s.Member.FullName,
                MemberEmail = s.Member.Email,
                MembershipPlanId = s.MembershipPlanId,
                PlanName = s.MembershipPlan.Name,
                PlanPrice = s.MembershipPlan.Price,
                PlanDurationDays = s.MembershipPlan.DurationInDays,
                GymId = s.GymId,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            };
        }

        public async Task<ApiResponse<SubscriptionResponseDto>> PublicSubscribeAsync(string slug, SubscribeRequestDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var gym = await _context.Gyms.FirstOrDefaultAsync(g => g.Slug == slug);
                if (gym == null)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Gym not found");

                var gymId = gym.Id;

                var plan = await _context.MembershipPlans
                    .FirstOrDefaultAsync(p => p.Id == dto.MembershipPlanId && p.GymId == gymId);
                if (plan == null)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Membership plan not found");

                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
                if (emailExists)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Email already exists");

                var user = new User
                {
                    Name = dto.FullName,
                    Email = dto.Email,
                    PasswordHash = _passwordHasher.HashPassword(dto.Password),
                    Role = "Member",
                    GymId = gymId
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                var member = new Member
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Address = "",
                    JoinDate = DateTime.UtcNow,
                    GymId = gymId,
                    UserId = user.Id,
                    Status = "Inactive"
                };

                await _context.Members.AddAsync(member);
                await _context.SaveChangesAsync();

                var startDate = (dto.StartDate.HasValue && dto.StartDate.Value.Date >= DateTime.UtcNow.Date)
                    ? dto.StartDate.Value.Date
                    : DateTime.UtcNow.Date;

                var endDate = startDate.AddDays(plan.DurationInDays);

                var subscription = new MemberSubscription
                {
                    MemberId = member.Id,
                    MembershipPlanId = plan.Id,
                    GymId = gymId,
                    StartDate = startDate,
                    EndDate = endDate,
                    Status = "Pending" // always Pending until payment is marked paid
                };

                await _context.MemberSubscriptions.AddAsync(subscription);
                await _context.SaveChangesAsync();

                var payment = new Payment
                {
                    MemberSubscriptionId = subscription.Id,
                    GymId = gymId,
                    Amount = plan.Price,
                    Status = "Pending",
                    PaymentMethod = "FakeGateway"
                };

                await _context.Payments.AddAsync(payment);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return ApiResponse<SubscriptionResponseDto>.Success(
                    "Subscription request submitted. Awaiting payment.",
                    new SubscriptionResponseDto
                    {
                        Id = subscription.Id,
                        MemberId = member.Id,
                        MemberName = member.FullName,
                        MemberEmail = member.Email,
                        MembershipPlanId = plan.Id,
                        PlanName = plan.Name,
                        PlanPrice = plan.Price,
                        PlanDurationDays = plan.DurationInDays,
                        GymId = gymId,
                        StartDate = subscription.StartDate,
                        EndDate = subscription.EndDate,
                        Status = subscription.Status,
                        CreatedAt = subscription.CreatedAt
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ApiResponse<SubscriptionResponseDto>> AdminAssignSubscriptionAsync(AdminAssignSubscriptionDto dto, int gymId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var mem = await _context.Members
                    .FirstOrDefaultAsync(m => m.Id == dto.MemberId && m.GymId == gymId);
                if (mem == null)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Member not found");

                var plan = await _context.MembershipPlans
                    .FirstOrDefaultAsync(p => p.Id == dto.MembershipPlanId && p.GymId == gymId);
                if (plan == null)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Membership plan not found");

                // ✅ Block if member already has Active OR Scheduled subscription
                var hasActiveOrScheduled = await _context.MemberSubscriptions
                    .AnyAsync(s => s.MemberId == mem.Id &&
                                   (s.Status == "Active" || s.Status == "Scheduled"));
                if (hasActiveOrScheduled)
                    return ApiResponse<SubscriptionResponseDto>.Fail("Member already has an active or scheduled subscription");

                var startDate = (dto.StartDate.HasValue && dto.StartDate.Value.Date >= DateTime.UtcNow.Date)
                    ? dto.StartDate.Value.Date
                    : DateTime.UtcNow.Date;

                var endDate = startDate.AddDays(plan.DurationInDays);

                var memberSubscription = new MemberSubscription
                {
                    MemberId = dto.MemberId,
                    MembershipPlanId = dto.MembershipPlanId,
                    GymId = gymId,
                    StartDate = startDate,
                    EndDate = endDate,
                    Status = "Pending" // always Pending until payment is marked paid
                };

                await _context.MemberSubscriptions.AddAsync(memberSubscription);
                await _context.SaveChangesAsync();

                var payment = new Payment
                {
                    MemberSubscriptionId = memberSubscription.Id,
                    GymId = gymId,
                    Amount = plan.Price,
                    Status = "Pending",
                    PaymentMethod = "FakeGateway"
                };

                await _context.Payments.AddAsync(payment);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return ApiResponse<SubscriptionResponseDto>.Success(
                    "Subscription assigned. Awaiting payment.",
                    new SubscriptionResponseDto
                    {
                        Id = memberSubscription.Id,
                        MemberId = mem.Id,
                        MemberName = mem.FullName,
                        MemberEmail = mem.Email,
                        MembershipPlanId = plan.Id,
                        PlanName = plan.Name,
                        PlanPrice = plan.Price,
                        PlanDurationDays = plan.DurationInDays,
                        GymId = gymId,
                        StartDate = memberSubscription.StartDate,
                        EndDate = memberSubscription.EndDate,
                        Status = memberSubscription.Status,
                        CreatedAt = memberSubscription.CreatedAt
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ✅ Renamed: returns Pending subscriptions (unpaid, awaiting payment)
        public async Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetPendingSubscriptionsAsync(int gymId, int pageNumber, int pageSize)
        {
            var query = _context.MemberSubscriptions
                .Include(x => x.Member)
                .Include(x => x.MembershipPlan)
                .Where(x => x.GymId == gymId && x.Status == "Pending")
                .OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var subscriptions = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<SubscriptionResponseDto>
            {
                Data = subscriptions.Select(MapToSubscriptionDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<SubscriptionResponseDto>>
                .Success("Pending subscriptions fetched", result);
        }

        public async Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetAllSubscriptionsAsync(
            int gymId, int pageNumber, int pageSize,
            string? status = null, int? memberId = null, int? membershipPlanId = null,
            DateTime? fromDate = null, DateTime? toDate = null,
            string? search = null, bool? isExpired = null,
            string sortBy = "CreatedAt", string sortOrder = "desc")
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            if (isExpired.HasValue && !string.IsNullOrWhiteSpace(status))
                return ApiResponse<ListResponse<SubscriptionResponseDto>>
                    .Fail("Cannot filter by both 'status' and 'isExpired' simultaneously.");

            var baseQuery = _context.MemberSubscriptions.Where(x => x.GymId == gymId);

            if (!string.IsNullOrWhiteSpace(status))
                baseQuery = baseQuery.Where(x => x.Status.ToLower() == status.Trim().ToLower());

            if (memberId.HasValue)
                baseQuery = baseQuery.Where(x => x.MemberId == memberId.Value);

            if (membershipPlanId.HasValue)
                baseQuery = baseQuery.Where(x => x.MembershipPlanId == membershipPlanId.Value);

            if (fromDate.HasValue)
                baseQuery = baseQuery.Where(x => x.CreatedAt >= fromDate.Value.Date);

            if (toDate.HasValue)
                baseQuery = baseQuery.Where(x => x.CreatedAt <= toDate.Value.Date.AddDays(1).AddTicks(-1));

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.Trim().ToLower();
                baseQuery = baseQuery.Where(x =>
                    x.Member.FullName.ToLower().Contains(searchLower) ||
                    x.Member.Email.ToLower().Contains(searchLower));
            }

            if (isExpired.HasValue)
            {
                baseQuery = isExpired.Value
                    ? baseQuery.Where(x => x.EndDate < DateTime.UtcNow)
                    : baseQuery.Where(x => x.EndDate >= DateTime.UtcNow);
            }

            baseQuery = (sortBy.Trim().ToLower(), sortOrder.Trim().ToLower()) switch
            {
                (SortFields.CreatedAt, SortOrder.Asc) => baseQuery.OrderBy(x => x.CreatedAt),
                (SortFields.CreatedAt, _) => baseQuery.OrderByDescending(x => x.CreatedAt),
                (SortFields.EndDate, SortOrder.Asc) => baseQuery.OrderBy(x => x.EndDate),
                (SortFields.EndDate, _) => baseQuery.OrderByDescending(x => x.EndDate),
                (SortFields.Price, SortOrder.Asc) => baseQuery.OrderBy(x => x.MembershipPlan.Price),
                (SortFields.Price, _) => baseQuery.OrderByDescending(x => x.MembershipPlan.Price),
                _ => baseQuery.OrderByDescending(x => x.CreatedAt)
            };

            var totalCount = await baseQuery.CountAsync();

            var subscriptions = await baseQuery
                .Include(x => x.Member)
                .Include(x => x.MembershipPlan)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<SubscriptionResponseDto>
            {
                Data = subscriptions.Select(MapToSubscriptionDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<SubscriptionResponseDto>>
                .Success("Subscriptions fetched successfully", result);
        }

        public async Task<ApiResponse<SubscriptionResponseDto>> CancelSubscriptionAsync(int subscriptionId, int gymId)
        {
            var subscription = await _context.MemberSubscriptions
                .Include(s => s.Member)
                .Include(s => s.MembershipPlan)
                .Include(s => s.Payments) // ✅ include payments
                .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.GymId == gymId);

            if (subscription == null)
                return ApiResponse<SubscriptionResponseDto>.Fail("Subscription not found");

            if (subscription.Status == "Cancelled")
                return ApiResponse<SubscriptionResponseDto>.Fail("Subscription is already cancelled");

            subscription.Status = "Cancelled";

           
            foreach (var payment in subscription.Payments.Where(p => p.Status == "Pending"))
                payment.Status = "Cancelled";

            var hasOtherActive = await _context.MemberSubscriptions
                .AnyAsync(s => s.MemberId == subscription.MemberId
                            && s.Status == "Active"
                            && s.Id != subscriptionId);

            if (!hasOtherActive)
                subscription.Member.Status = "Inactive";

            await _context.SaveChangesAsync();

            return ApiResponse<SubscriptionResponseDto>.Success("Subscription cancelled successfully", MapToSubscriptionDto(subscription));
        }

        public async Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetMySubscriptionsAsync(int userId, int gymId, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            var member = await _context.Members
                .FirstOrDefaultAsync(x => x.UserId == userId && x.GymId == gymId);

            if (member == null)
                return ApiResponse<ListResponse<SubscriptionResponseDto>>.Fail("Member not found");

            var query = _context.MemberSubscriptions
                .Include(s => s.Member)
                .Include(s => s.MembershipPlan)
                .Where(s => s.MemberId == member.Id && s.GymId == gymId)
                .OrderByDescending(s => s.CreatedAt);

            var totalCount = await query.CountAsync();

            var subscriptions = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<SubscriptionResponseDto>
            {
                Data = subscriptions.Select(MapToSubscriptionDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<SubscriptionResponseDto>>.Success("Member subscriptions fetched", result);
        }
    }
}