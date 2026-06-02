using GymRat.Data;
using GymRat.DTOs;
using GymRat.Models;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class MembershipPlanService : IMembershipPlanService
    {
        private readonly AppDbContext _context;

        public MembershipPlanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<MembershipPlanResponseDto>> CreateMemberShipPlanAsync(CreateMembershipPlanDto dto, int gymId)
        {
            var existingPlan = await _context.MembershipPlans.FirstOrDefaultAsync(x => x.Name == dto.Name && x.GymId == gymId);
            if (existingPlan != null)
            {
                return ApiResponse<MembershipPlanResponseDto>.Fail("Membership Plan already exists");
            }
            var membershipPlan = new MembershipPlan
            {
                Name = dto.Name,
                Price = dto.Price,
                DurationInDays = dto.DurationInDays,
                Description = dto.Description,
                GymId = gymId
            };
            _context.MembershipPlans.Add(membershipPlan);
            await _context.SaveChangesAsync();

            var memberPlan = new MembershipPlanResponseDto
            {
                Id = membershipPlan.Id,
                Name = membershipPlan.Name,
                Price = membershipPlan.Price,
                DurationInDays = membershipPlan.DurationInDays,
                Description = membershipPlan.Description,
                IsActive = membershipPlan.IsActive
            };
            return ApiResponse<MembershipPlanResponseDto>.Success("Membership Plan created succussfully", memberPlan);
        }

        public async Task<ApiResponse<List<MembershipPlanResponseDto>>> GetAllPlansAsync(int gymId)
        {
            var plans = await _context.MembershipPlans
                .Where(p => p.GymId == gymId && p.IsActive)
                .Select(p => new MembershipPlanResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    DurationInDays = p.DurationInDays,
                    Description = p.Description,
                    IsActive = p.IsActive,
                })
                .ToListAsync();

            return ApiResponse<List<MembershipPlanResponseDto>>
                .Success("Plans fetched", plans);
        }

    }
}