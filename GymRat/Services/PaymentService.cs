using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Payment;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;

        public PaymentService(AppDbContext context)
        {
            _context = context;
        }

        private PaymentResponseDto MapToDto(Models.Payment p)
        {
            return new PaymentResponseDto
            {
                Id = p.Id,
                MemberSubscriptionId = p.MemberSubscriptionId,
                Amount = p.Amount,
                Status = p.Status,
                PaymentMethod = p.PaymentMethod,
                TransactionId = p.TransactionId,
                CreatedAt = p.CreatedAt,
                PaidAt = p.PaidAt
            };
        }

        public async Task<ApiResponse<PaymentResponseDto>> MarkPaymentPaidAsync(int paymentId, int gymId)
        {
            var payment = await _context.Payments
                .Include(p => p.MemberSubscription)
                .ThenInclude(ms => ms.Member)
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.GymId == gymId);

            if (payment == null)
                return ApiResponse<PaymentResponseDto>.Fail("Payment not found");

            if (payment.Status == "Paid")
                return ApiResponse<PaymentResponseDto>.Fail("Payment already completed");

            if (payment.Status == "Cancelled")
                return ApiResponse<PaymentResponseDto>.Fail("Cannot pay a cancelled payment");

            var subscription = payment.MemberSubscription;
            

            if (subscription != null && subscription.Status != "Pending")
                return ApiResponse<PaymentResponseDto>.Fail($"Cannot process payment for a '{subscription.Status}' subscription");

            payment.Status = "Paid";
            payment.PaidAt = DateTime.UtcNow;
            payment.TransactionId = Guid.NewGuid().ToString();

            if ( subscription != null && subscription.StartDate.Date <= DateTime.UtcNow.Date)
            {
                subscription.Status = "Active";
                subscription.Member.Status = "Active";
            }
            else
            {
                subscription.Status = "Scheduled";
                // Member stays Inactive — background job will activate on StartDate
            }

            await _context.SaveChangesAsync();

            return ApiResponse<PaymentResponseDto>
                .Success("Payment completed successfully", MapToDto(payment));
        }

        public async Task<ApiResponse<ListResponse<PaymentResponseDto>>> GetAllPaymentsAsync(int gymId, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            var query = _context.Payments
                .Where(p => p.GymId == gymId)
                .OrderByDescending(p => p.CreatedAt);

            var totalCount = await query.CountAsync();

            var payments = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<PaymentResponseDto>
            {
                Data = payments.Select(MapToDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<PaymentResponseDto>>
                .Success("Payments fetched successfully", result);
        }
    }
}