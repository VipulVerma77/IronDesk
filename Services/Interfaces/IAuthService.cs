using GymRat.DTOs;
using GymRat.DTOs.Auth;

namespace GymRat.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto, int gymId);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string? incomingToken);
        Task<ApiResponse<object>> LogoutAsync(string? incomingToken);
        Task<ApiResponse<object>> GetProfileAsync(int userId);
    }
}