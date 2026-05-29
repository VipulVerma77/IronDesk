using GymRat.DTOs;

namespace GymRat.Services.Interfaces
{
    public interface IMembershipPlanService
    {
        Task<ApiResponse<MembershipPlanResponseDto>>CreateMemberShipPlanAsync(CreateMembershipPlanDto dto , int gymId);
    }
}