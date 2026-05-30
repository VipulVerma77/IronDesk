using GymRat.DTOs;
using GymRat.DTOs.Attendance;

namespace GymRat.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task<ApiResponse<AttendanceResponseDto>> CheckInAsync(int gymId, CheckInRequestDto dto);
        Task<ApiResponse<AttendanceResponseDto>> CheckOutAsync(int gymId, CheckOutRequestDto dto);
        Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetTodayAttendanceAsync(int gymId, int pageNumber, int pageSize);
        Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetAttendanceByMemberAsync(int gymId, int memberId, int pageNumber, int pageSize);
        Task<ApiResponse<ListResponse<AttendanceResponseDto>>> GetAttendanceByDateRangeAsync(int gymId, DateTime fromDate, DateTime toDate, int pageNumber, int pageSize);
    }
}