using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.User;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(AppDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        private UserResponseDto MapToDto(Models.User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                UserImagePath = user.UserImagePath,
                GymId = user.GymId
            };
        }

        // ─────────────────────────────────────────
        // USER: Update own profile
        // ─────────────────────────────────────────
        // ─────────────────────────────────────────
        // ADMIN: Soft delete user
        // ─────────────────────────────────────────
        public async Task<ApiResponse<object>> AdminDeleteUserAsync(int targetUserId, int gymId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == targetUserId
                                       && u.GymId == gymId
                                       && !u.IsDeleted); 

            if (user == null)
                return ApiResponse<object>.Fail("User not found in your gym");

            if (user.Role == "Admin")
                return ApiResponse<object>.Fail("Cannot delete an admin account");

            //  deactivate account delete
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            //  Revoke all refresh tokens — force logout immediately
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == targetUserId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
                token.IsRevoked = true;

            //  Member record stays — history preserved
            //  Attendance stays
            //  Payments stay
            //  Subscriptions stay

            await _context.SaveChangesAsync();

            return ApiResponse<object>.Success("User deactivated successfully", null);
        }

        // ─────────────────────────────────────────
        // ADMIN: Update any user in their gym
        // ─────────────────────────────────────────
        public async Task<ApiResponse<UserResponseDto>> AdminUpdateUserAsync(int targetUserId, int gymId, UpdateProfileDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == targetUserId
                                       && u.GymId == gymId
                                       && !u.IsDeleted); // ✅ cannot update deleted user

            if (user == null)
                return ApiResponse<UserResponseDto>.Fail("User not found in your gym");

            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            // ✅ Sync member record
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.UserId == targetUserId && m.GymId == gymId);

            if (member != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.Name))
                    member.FullName = dto.Name;

                if (!string.IsNullOrWhiteSpace(dto.Phone))
                    member.Phone = dto.Phone;
            }

            await _context.SaveChangesAsync();

            return ApiResponse<UserResponseDto>.Success("User updated successfully", MapToDto(user));
        }

        // ─────────────────────────────────────────
        // ADMIN: Reset member password
        // ─────────────────────────────────────────
        public async Task<ApiResponse<object>> AdminResetPasswordAsync(int targetUserId, int gymId, ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return ApiResponse<object>.Fail("New password is required");

            if (dto.NewPassword.Length < 6)
                return ApiResponse<object>.Fail("Password must be at least 6 characters");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == targetUserId
                                       && u.GymId == gymId
                                       && !u.IsDeleted); 

            if (user == null)
                return ApiResponse<object>.Fail("User not found in your gym");

            if (user.Role == "Admin")
                return ApiResponse<object>.Fail("Cannot reset admin password this way");

            user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);

            //  Revoke all refresh tokens
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == targetUserId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
                token.IsRevoked = true;

            await _context.SaveChangesAsync();

            return ApiResponse<object>.Success("Password reset successfully", null);
        }

        // ─────────────────────────────────────────
        // USER: Update own profile
        // ─────────────────────────────────────────
        public async Task<ApiResponse<UserResponseDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
                return ApiResponse<UserResponseDto>.Fail("User not found");

            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            //  Sync member record
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (member != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.Name))
                    member.FullName = dto.Name;

                if (!string.IsNullOrWhiteSpace(dto.Phone))
                    member.Phone = dto.Phone;
            }

            await _context.SaveChangesAsync();

            return ApiResponse<UserResponseDto>.Success("Profile updated successfully", MapToDto(user));
        }

        // ─────────────────────────────────────────
        // USER: Change own password
        // ─────────────────────────────────────────
        public async Task<ApiResponse<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.OldPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return ApiResponse<object>.Fail("All fields are required");

            if (dto.NewPassword.Length < 6)
                return ApiResponse<object>.Fail("New password must be at least 6 characters");

            if (dto.OldPassword == dto.NewPassword)
                return ApiResponse<object>.Fail("New password cannot be same as old password");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
                return ApiResponse<object>.Fail("User not found");

            if (!_passwordHasher.VerifyPassword(dto.OldPassword, user.PasswordHash))
                return ApiResponse<object>.Fail("Old password is incorrect");

            user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);

            // Revoke all refresh tokens — force re-login
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
                token.IsRevoked = true;

            await _context.SaveChangesAsync();

            return ApiResponse<object>.Success("Password changed successfully. Please login again.", null);
        }
    }
}