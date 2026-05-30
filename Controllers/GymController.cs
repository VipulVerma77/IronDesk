using System.Security.Claims;
using GymRat.DTOs.Gym;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GymController : ControllerBase
    {
        private readonly IGymService _gymService;

        public GymController(IGymService gymService)
        {
            _gymService = gymService;
        }

        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] GymRegistrationDto dto)
        {
            var result = await _gymService.RegisterGymAsync(dto);
            return Ok(result);
        }

        // ─────────────────────────────────────────
        // PUBLIC — Get gym by slug
        // ─────────────────────────────────────────
        [HttpGet("public/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var result = await _gymService.GetBySlugAsync(slug);
            return Ok(result);
        }

        // ─────────────────────────────────────────
        // ADMIN — Get own gym
        // ─────────────────────────────────────────
        [Authorize(Roles = "Admin")]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyGym()
        {
            var gymId = GetGymId();
            var result = await _gymService.GetMyGymAsync(gymId);
            return Ok(result);
        }

       
        [Authorize(Roles = "Admin")]
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateGymDto dto)
        {
            var gymId = GetGymId();
            var result = await _gymService.UpdateGymAsync(gymId, dto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-theme")]
        public async Task<IActionResult> UpdateTheme([FromBody] UpdateThemeDto dto)
        {
            var gymId = GetGymId();
            var result = await _gymService.UpdateThemeAsync(gymId, dto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete()
        {
            var gymId = GetGymId();
            var result = await _gymService.DeleteGymAsync(gymId);
            return Ok(result);
        }
    }
}