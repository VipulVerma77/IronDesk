using GymRat.DTOs;
using GymRat.DTOs.Dashboard;

namespace GymRat.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<ApiResponse<DashboardResponseDto>> GetSummaryAsync(int gymId);
    }
}