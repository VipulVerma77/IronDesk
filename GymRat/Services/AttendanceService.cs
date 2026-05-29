using GymRat.Data;
using GymRat.DTOs;
using GymRat.DTOs.Attendance;
using GymRat.Models;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _context;

        public AttendanceService(AppDbContext context)
        {
            _context = context;
        }

        private AttendanceResponseDto MapToDto(Attendance a)
        {
            return new AttendanceResponseDto
            {
                Id = a.Id,
                MemberId = a.MemberId,
                MemberName = a.Member.FullName,
                Date = a.Date,
                CheckInTime = a.CheckInTime,
                CheckOutTime = a.CheckOutTime
            };
        }

        public async Task<ApiResponse<AttendanceResponseDto>> CheckInAsync(int gymId, CheckInRequestDto dto)
        {
            // 1. Find member in this gym
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.Id == dto.MemberId && m.GymId == gymId);

            if (member == null)
                return ApiResponse<AttendanceResponseDto>.Fail("Member not found");

            // 2. Only Active members can check in
            if (member.Status != "Active")
                return ApiResponse<AttendanceResponseDto>.Fail("Member is not active. Please ensure subscription is paid.");

            // 3. Check if member has an open check-in today (checked in but not checked out)
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var openCheckIn = await _context.Attendances
                .FirstOrDefaultAsync(a => a.MemberId == dto.MemberId
                                       && a.GymId == gymId
                                       && a.Date == today
                                       && a.CheckOutTime == null);

            if (openCheckIn != null)
                return ApiResponse<AttendanceResponseDto>.Fail("Member is already checked in. Please checkout first.");

            // 4. Create new check-in
            var attendance = new Attendance
            {
                MemberId = dto.MemberId,
                GymId = gymId,
                CheckInTime = DateTime.UtcNow,
                CheckOutTime = null,
                Date = today
            };

            await _context.Attendances.AddAsync(attendance);
            await _context.SaveChangesAsync();

            // Load member for mapping
            attendance.Member = member;

            return ApiResponse<AttendanceResponseDto>.Success("Check-in successful", MapToDto(attendance));
        }

        public async Task<ApiResponse<AttendanceResponseDto>> CheckOutAsync(int gymId, CheckOutRequestDto dto)
        {
            // 1. Find the specific attendance record
            var attendance = await _context.Attendances
                .Include(a => a.Member)
                .FirstOrDefaultAsync(a => a.Id == dto.AttendanceId && a.GymId == gymId);

            if (attendance == null)
                return ApiResponse<AttendanceResponseDto>.Fail("Attendance record not found");

            // 2. Already checked out?
            if (attendance.CheckOutTime != null)
                return ApiResponse<AttendanceResponseDto>.Fail("Member already checked out");

            // 3. Set checkout time
            attendance.CheckOutTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<AttendanceResponseDto>.Success("Check-out successful", MapToDto(attendance));
        }

        public async Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetTodayAttendanceAsync(int gymId, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var query = _context.Attendances
                .Include(a => a.Member)
                .Where(a => a.GymId == gymId && a.Date == today)
                .OrderByDescending(a => a.CheckInTime);

            var totalCount = await query.CountAsync();

            var records = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<AttendanceResponseDto>
            {
                Data = records.Select(MapToDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<AttendanceResponseDto>>
                .Success("Today's attendance fetched", result);
        }

        public async Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetAttendanceByMemberAsync(int gymId, int memberId, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            var memberExists = await _context.Members
                .AnyAsync(m => m.Id == memberId && m.GymId == gymId);

            if (!memberExists)
                return ApiResponse<ListResponse<AttendanceResponseDto>>.Fail("Member not found");

            var query = _context.Attendances
                .Include(a => a.Member)
                .Where(a => a.GymId == gymId && a.MemberId == memberId)
                .OrderByDescending(a => a.CheckInTime);

            var totalCount = await query.CountAsync();

            var records = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<AttendanceResponseDto>
            {
                Data = records.Select(MapToDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<AttendanceResponseDto>>
                .Success("Member attendance fetched", result);
        }

        public async Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetAttendanceByDateRangeAsync(int gymId, DateTime fromDate, DateTime toDate, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = Math.Min(pageSize <= 0 ? 10 : pageSize, 50);

            if (fromDate > toDate)
                return ApiResponse<ListResponse<AttendanceResponseDto>>.Fail("fromDate cannot be greater than toDate");

            var from = DateOnly.FromDateTime(fromDate);
            var to = DateOnly.FromDateTime(toDate);

            var query = _context.Attendances
                .Include(a => a.Member)
                .Where(a => a.GymId == gymId && a.Date >= from && a.Date <= to)
                .OrderByDescending(a => a.CheckInTime);

            var totalCount = await query.CountAsync();

            var records = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new ListResponse<AttendanceResponseDto>
            {
                Data = records.Select(MapToDto).ToList(),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ListResponse<AttendanceResponseDto>>
                .Success("Attendance fetched", result);
        }
    }
}