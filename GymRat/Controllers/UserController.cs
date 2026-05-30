using System.Security.Claims;
using GymRat.DTOs.User;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue("UserId")!);
        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);

  
        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            var result = await _userService.UpdateProfileAsync(userId, dto);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetUserId();
            var result = await _userService.ChangePasswordAsync(userId, dto);
            return Ok(result);
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{targetUserId}")]
        public async Task<IActionResult> AdminUpdateUser(int targetUserId, [FromBody] UpdateProfileDto dto)
        {
            if (targetUserId <= 0)
                return BadRequest("Invalid userId");

            var gymId = GetGymId();
            var result = await _userService.AdminUpdateUserAsync(targetUserId, gymId, dto);
            return Ok(result);
        }

      
        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{targetUserId}")]
        public async Task<IActionResult> AdminDeleteUser(int targetUserId)
        {
            if (targetUserId <= 0)
                return BadRequest("Invalid userId");

            var gymId = GetGymId();
            var result = await _userService.AdminDeleteUserAsync(targetUserId, gymId);
            return Ok(result);
        }

      
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{targetUserId}/reset-password")]
        public async Task<IActionResult> AdminResetPassword(int targetUserId, [FromBody] ResetPasswordDto dto)
        {
            if (targetUserId <= 0)
                return BadRequest("Invalid userId");

            var gymId = GetGymId();
            var result = await _userService.AdminResetPasswordAsync(targetUserId, gymId, dto);
            return Ok(result);
        }
    }
}