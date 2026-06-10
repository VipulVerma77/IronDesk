using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Gym;
using GymRat.Models;
using GymRat.Services.Helper;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class GymService : IGymService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        private static readonly HashSet<string> ValidThemes = new()
        {
            "default", "dark", "blue", "green", "red"
        };

        public GymService(AppDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        private GymResponseDto MapToDto(Gym gym)
        {
            return new GymResponseDto
            {
                Id = gym.Id,
                Name = gym.Name,
                Email = gym.Email,
                Phone = gym.Phone,
                Address = gym.Address,
                Slug = gym.Slug,
                Description = gym.Description,
                LogoPath = gym.LogoPath,
                Theme = gym.Theme,
                CreatedAt = gym.CreatedAt
            };
        }

        public async Task<ApiResponse<GymResponseDto>> RegisterGymAsync(GymRegistrationDto dto)
        {
            var gymEmailExists = await _context.Gyms
                .AnyAsync(g => g.Email.ToLower() == dto.GymEmail.ToLower());

            if (gymEmailExists)
                return ApiResponse<GymResponseDto>.Fail("Gym email already exists");

            var adminEmailExists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == dto.AdminEmail.ToLower());

            if (adminEmailExists)
                return ApiResponse<GymResponseDto>.Fail("Admin email already exists");

            var gym = new Gym
            {
                Name = dto.GymName,
                Email = dto.GymEmail,
                Phone = dto.Phone,
                Address = dto.Address,
                Description = dto.Description,
                Slug = SlugHelper.GenerateSlug(dto.GymName),
                Theme = "default"
            };

            _context.Gyms.Add(gym);
            await _context.SaveChangesAsync();

            var admin = new User
            {
                Name = dto.AdminName,
                Email = dto.AdminEmail,
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = "Admin",
                GymId = gym.Id
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();

            return ApiResponse<GymResponseDto>.Success("Gym registered successfully", MapToDto(gym));
        }

        public async Task<ApiResponse<GymResponseDto>> GetMyGymAsync(int gymId)
        {
            var gym = await _context.Gyms.FindAsync(gymId);

            if (gym == null)
                return ApiResponse<GymResponseDto>.Fail("Gym not found");

            return ApiResponse<GymResponseDto>.Success("Gym fetched", MapToDto(gym));
        }

        public async Task<ApiResponse<GymResponseDto>> UpdateGymAsync(int gymId, UpdateGymDto dto)
        {
            var gym = await _context.Gyms.FindAsync(gymId);

            if (gym == null)
                return ApiResponse<GymResponseDto>.Fail("Gym not found");

            if (!string.IsNullOrWhiteSpace(dto.Name))
                gym.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Phone))
                gym.Phone = dto.Phone;

            if (!string.IsNullOrWhiteSpace(dto.Address))
                gym.Address = dto.Address;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                gym.Description = dto.Description;

            await _context.SaveChangesAsync();

            return ApiResponse<GymResponseDto>.Success("Gym updated successfully", MapToDto(gym));
        }

        public async Task<ApiResponse<GymResponseDto>> UpdateThemeAsync(int gymId, UpdateThemeDto dto)
        {
            if (!ValidThemes.Contains(dto.Theme.ToLower()))
                return ApiResponse<GymResponseDto>.Fail($"Invalid theme. Valid options: {string.Join(", ", ValidThemes)}");

            var gym = await _context.Gyms.FindAsync(gymId);

            if (gym == null)
                return ApiResponse<GymResponseDto>.Fail("Gym not found");

            gym.Theme = dto.Theme.ToLower();
            await _context.SaveChangesAsync();

            return ApiResponse<GymResponseDto>.Success("Theme updated successfully", MapToDto(gym));
        }

        public async Task<ApiResponse<PublicGymResponseDto>> GetBySlugAsync(string slug)
        {
            var gym = await _context.Gyms
                .Include(g => g.MembershipPlans)
                .FirstOrDefaultAsync(g => g.Slug == slug);

            if (gym == null)
                return ApiResponse<PublicGymResponseDto>.Fail("Gym not found");

            var activeMemberCount = await _context.Members
   .CountAsync(m => m.GymId == gym.Id && m.Status == "Active");

            var result = new PublicGymResponseDto
            {
                Id = gym.Id,
                Name = gym.Name,
                Description = gym.Description,
                LogoPath = gym.LogoPath,
                Theme = gym.Theme,
                Slug = gym.Slug,
                ActiveMemberCount = activeMemberCount,
                Plans = gym.MembershipPlans.Select(p => new PublicPlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    DurationInDays = p.DurationInDays,
                    Description = p.Description
                }).ToList()
            };

            return ApiResponse<PublicGymResponseDto>.Success("Gym fetched", result);
        }

        public async Task<ApiResponse<object>> DeleteGymAsync(int gymId)
        {
            var gym = await _context.Gyms.FindAsync(gymId);

            if (gym == null)
                return ApiResponse<object>.Fail("Gym not found");

            _context.Gyms.Remove(gym);
            await _context.SaveChangesAsync();

            return ApiResponse<object>.Success("Gym deleted successfully", null);
        }
    }
}