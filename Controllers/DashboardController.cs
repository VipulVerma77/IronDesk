using System.Security.Claims;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var gymId = GetGymId();

            if (gymId <= 0)
                return BadRequest("Invalid GymId");

            var result = await _dashboardService.GetSummaryAsync(gymId);
            return Ok(result);
        }
    }
}