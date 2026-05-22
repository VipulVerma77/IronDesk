using GymRat.DTOs;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memService;

        public MemberController(IMemberService service)
        {
            _memService = service;
        }

        [HttpPost("member")]
        public async Task<IActionResult> MemberRegister(MemberDto dto)
        {
                if (string.IsNullOrWhiteSpace(dto.FullName) ||
                    string.IsNullOrWhiteSpace(dto.Email) ||
                    string.IsNullOrWhiteSpace(dto.Phone) ||
                    string.IsNullOrWhiteSpace(dto.Address))
                {
                    return BadRequest(
                        ApiResponse<object>.Fail("All fields are required"));
                }

                var gymIdClaim = User.FindFirst("GymId")?.Value;

                if (string.IsNullOrEmpty(gymIdClaim))
                {
                    return Unauthorized(
                        ApiResponse<object>.Fail("GymId not found"));
                }

                int gymId = int.Parse(gymIdClaim);

                var result = await _memService.AddMemberAsync(dto, gymId);

                return Ok(result);
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetAllMembers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var gymIdClaim = User.FindFirst("GymId")?.Value;

                if (string.IsNullOrWhiteSpace(gymIdClaim))
                {
                    return Unauthorized(
                        ApiResponse<object>.Fail("You are not authorized to this page"));
                }

                int gymId = int.Parse(gymIdClaim);

                var result = await _memService.GetAllMembersAsync(gymId, pageNumber, pageSize);

                return Ok(result);
        }
    }
}