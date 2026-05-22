using GymRat.DTOs;
using GymRat.DTOs.Subscription;


namespace GymRat.Services.Interfaces
{
    public interface ISubscriptionService
    {
        // FLOW 1: Public user self-subscribes to a gym
        Task<ApiResponse<SubscriptionResponseDto>> PublicSubscribeAsync(string slug, SubscribeRequestDto dto);

        // FLOW 2: Admin manually assigns a subscription to an existing member
        Task<ApiResponse<SubscriptionResponseDto>> AdminAssignSubscriptionAsync(AdminAssignSubscriptionDto dto, int gymId);

        // Admin: get all pending subscriptions for their gym
        Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetPendingSubscriptionsAsync(int gymId, int pageNumber, int pageSize);

        Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetAllSubscriptionsAsync(int gymId, int pageNumber, int pageSize, string? status, int? memberId, int? membershipPlanId, DateTime? fromDate, DateTime? toDate, string? search, bool? isExpired, string sortBy,string sortOrder);

        Task<ApiResponse<SubscriptionResponseDto>> CancelSubscriptionAsync(int subscriptionId, int gymId);

        Task<ApiResponse<ListResponse<SubscriptionResponseDto>>> GetMySubscriptionsAsync(int userId, int gymId, int pageNumber, int pageSize);
    }
}