using GymRat.DTOs;
using GymRat.DTOs.User;

namespace GymRat.Services.Interfaces
{
    public interface IUserService
    {
        // User updates own profile
        Task<ApiResponse<UserResponseDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto);

        // User changes own password
        Task<ApiResponse<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto);

        // Admin updates any user in their gym
        Task<ApiResponse<UserResponseDto>> AdminUpdateUserAsync(int targetUserId, int gymId, UpdateProfileDto dto);

        // Admin deletes any user in their gym
        Task<ApiResponse<object>> AdminDeleteUserAsync(int targetUserId, int gymId);

        // Admin resets any member password
        Task<ApiResponse<object>> AdminResetPasswordAsync(int targetUserId, int gymId, ResetPasswordDto dto);
    }
}