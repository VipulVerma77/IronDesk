using GymRat.DTOs;
using GymRat.DTOs.Gym;

namespace GymRat.Services.Interfaces
{
    public interface IGymService
    {
        Task<ApiResponse<GymResponseDto>> RegisterGymAsync(GymRegistrationDto dto);
        Task<ApiResponse<GymResponseDto>> GetMyGymAsync(int gymId);
        Task<ApiResponse<GymResponseDto>> UpdateGymAsync(int gymId, UpdateGymDto dto);
        Task<ApiResponse<GymResponseDto>> UpdateThemeAsync(int gymId, UpdateThemeDto dto);
        Task<ApiResponse<PublicGymResponseDto>> GetBySlugAsync(string slug);
        Task<ApiResponse<object>> DeleteGymAsync(int gymId);
    }
}