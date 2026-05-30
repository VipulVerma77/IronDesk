using GymRat.DTOs;
using GymRat.DTOs.Auth;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        private int GetUserId() => int.Parse(User.FindFirst("UserId")!.Value);
        private int GetGymId() => int.Parse(User.FindFirst("GymId")!.Value);

        // ─────────────────────────────────────────
        // REGISTER
        // ─────────────────────────────────────────
        [Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var gymId = GetGymId();
            var result = await _authService.RegisterAsync(dto, gymId);
            return Ok(result);
        }

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (!result.IsSuccess)
                return Unauthorized(result);


            if (result.Data?.RefreshToken != null)
                SetRefreshTokenCookie(result.Data.RefreshToken);

            return Ok(result);
        }

    
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto? dto)
        {
            //  Cookie first, body fallback
            var incomingToken = Request.Cookies["refreshToken"] ?? dto?.RefreshToken;

            var result = await _authService.RefreshTokenAsync(incomingToken);

            if (!result.IsSuccess)
                return Unauthorized(result);

            if (result.Data?.RefreshToken != null)
                SetRefreshTokenCookie(result.Data.RefreshToken);

            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto? dto)
        {
            // ✅ Cookie first, body fallback
            var incomingToken = Request.Cookies["refreshToken"] ?? dto?.RefreshToken;

            var result = await _authService.LogoutAsync(incomingToken);

            // ✅ Clear cookie regardless
            Response.Cookies.Delete("refreshToken");

            return Ok(result);
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var result = await _authService.GetProfileAsync(userId);
            return Ok(result);
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }
    }
}