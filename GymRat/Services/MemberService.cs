using GymRat.Data;
using GymRat.DTOs;
using GymRat.Models;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class MemberService : IMemberService
    {
        private readonly AppDbContext _context;

        public MemberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<MemberResponseDto>> AddMemberAsync(MemberDto memberDto, int gymId)
        {
            var exists = await _context.Members.AnyAsync(x => x.Email == memberDto.Email && x.GymId == gymId);
            if (exists)
            {
                return ApiResponse<MemberResponseDto>.Fail("Member already exists");
            }

            var tempPassword = memberDto.FullName.Replace(" ", "").ToLower() + "@123";

            var user = new User
            {
                Name = memberDto.FullName,
                Email = memberDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword),
                Role = "Member",
                GymId = gymId
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var member = new Member
            {
                FullName = memberDto.FullName,
                Email = memberDto.Email,
                Phone = memberDto.Phone,
                Address = memberDto.Address,
                JoinDate = memberDto.JoinDate,
                GymId = gymId,
                UserId   = user.Id,
                Status = "Active"
            };

            _context.Members.Add(member);

            await _context.SaveChangesAsync();

            var response = new MemberResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                Email = member.Email,
                Phone = member.Phone,
                Address = member.Address,
                Status = member.Status,
                JoinDate = member.JoinDate
            };

            return ApiResponse<MemberResponseDto>.Success("Member created successfully", response);
        }

        public async Task<ApiResponse<ListResponse<MemberResponseDto>>> GetAllMembersAsync(int gymId, int pageNumber, int pageSize)
        {
            var query =  _context.Members.Where(m => m.GymId == gymId);

            var totalCount = await query.CountAsync();

            var members = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(m => new MemberResponseDto
            {
                Id = m.Id,
                FullName = m.FullName,
                Email = m.Email,
                Phone = m.Phone,
                Address = m.Address,
                Status = m.Status,
                JoinDate = m.JoinDate
            })
                .ToListAsync();

            var result = new ListResponse<MemberResponseDto>
            {
                Data = members,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<MemberResponseDto>>
                .Success("Members fetched successfully", result);
        }
    }
}