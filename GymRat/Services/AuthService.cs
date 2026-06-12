using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Auth;
using GymRat.Models;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _passwordHasher;

        private const int RefreshTokenExpiryDays = 7;

        public AuthService(AppDbContext context, ITokenService tokenService, IPasswordHasher passwordHasher)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto, int gymId)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Password))
                return ApiResponse<AuthResponseDto>.Fail("All fields are required");

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (emailExists)
                return ApiResponse<AuthResponseDto>.Fail("Email already exists");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = dto.Role,
                GymId = gymId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Success("User registered successfully", new AuthResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            });
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return ApiResponse<AuthResponseDto>.Fail("All fields are required");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
                return ApiResponse<AuthResponseDto>.Fail("Invalid email or password");

            //  Block soft deleted users
            if (user.IsDeleted)
                return ApiResponse<AuthResponseDto>.Fail("This account has been deactivated. Contact your gym admin.");

            if (!_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
                return ApiResponse<AuthResponseDto>.Fail("Invalid email or password");

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = await CreateAndSaveRefreshTokenAsync(user.Id);

            return ApiResponse<AuthResponseDto>.Success("Login successful", new AuthResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }
        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string? incomingToken)
        {
            if (string.IsNullOrWhiteSpace(incomingToken))
                return ApiResponse<AuthResponseDto>.Fail("Refresh token is required");

            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == incomingToken);

            if (storedToken == null)
                return ApiResponse<AuthResponseDto>.Fail("Invalid refresh token");

            if (storedToken.IsRevoked)
                return ApiResponse<AuthResponseDto>.Fail("Refresh token has been revoked");

            if (storedToken.ExpiresAt < DateTime.UtcNow)
                return ApiResponse<AuthResponseDto>.Fail("Refresh token expired. Please login again.");

            // ✅ Rotate — revoke old, issue new
            storedToken.IsRevoked = true;

            var newRefreshToken = await CreateAndSaveRefreshTokenAsync(storedToken.UserId);
            var newAccessToken = _tokenService.GenerateAccessToken(storedToken.User);

            await _context.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Success("Token refreshed", new AuthResponseDto
            {
                Id = storedToken.User.Id,
                Name = storedToken.User.Name,
                Email = storedToken.User.Email,
                Role = storedToken.User.Role,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        public async Task<ApiResponse<object>> LogoutAsync(string? incomingToken)
        {
            if (!string.IsNullOrWhiteSpace(incomingToken))
            {
                var storedToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == incomingToken);

                if (storedToken != null)
                {
                    storedToken.IsRevoked = true;
                    await _context.SaveChangesAsync();
                }
            }

            return ApiResponse<object>.Success("Logged out successfully", null);
        }

        public async Task<ApiResponse<object>> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return ApiResponse<object>.Fail("User not found");

            return ApiResponse<object>.Success("Profile fetched", new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.GymId,
                user.UserImagePath
            });
        }

        // ─────────────────────────────────────────
        // PRIVATE HELPER
        // ─────────────────────────────────────────
        private async Task<string> CreateAndSaveRefreshTokenAsync(int userId)
        {
            var token = _tokenService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Token = token,
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            return token;
        }
    }
}