using System.Security.Claims;
using GymRat.DTOs.Attendance;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequestDto dto)
        {
            if (dto.MemberId <= 0)
                return BadRequest("Invalid MemberId");

            var gymId = GetGymId();
            var result = await _attendanceService.CheckInAsync(gymId, dto);
            return Ok(result);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequestDto dto)
        {
            if (dto.AttendanceId <= 0)
                return BadRequest("Invalid AttendanceId");

            var gymId = GetGymId();
            var result = await _attendanceService.CheckOutAsync(gymId, dto);
            return Ok(result);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var gymId = GetGymId();
            var result = await _attendanceService.GetTodayAttendanceAsync(gymId, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetByMember(
            int memberId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (memberId <= 0)
                return BadRequest("Invalid MemberId");

            var gymId = GetGymId();
            var result = await _attendanceService.GetAttendanceByMemberAsync(gymId, memberId, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate,[FromQuery] DateTime toDate,[FromQuery] int pageNumber = 1,[FromQuery] int pageSize = 10)
        {
            var gymId = GetGymId();
            var result = await _attendanceService.GetAttendanceByDateRangeAsync(gymId, fromDate, toDate, pageNumber, pageSize);
            return Ok(result);
        }
    }
}