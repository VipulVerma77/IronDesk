using GymRat.DTOs;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]

    public class MembershipPlanController : ControllerBase
    {
        private readonly IMembershipPlanService _service;
        public MembershipPlanController(IMembershipPlanService service)
        {
            _service = service;
        }


        [HttpPost]
        public async Task<IActionResult> CreateMembershipPlan(CreateMembershipPlanDto dto)
        {

            var gymIdClaim = User.FindFirst("GymId")?.Value;

            if (string.IsNullOrEmpty(gymIdClaim))
            {
                return Unauthorized(
                    ApiResponse<object>.Fail("GymId not found"));
            }

            int gymId = int.Parse(gymIdClaim);
            var result = await _service.CreateMemberShipPlanAsync(dto, gymId);
            if (result.Data == null)
            {
                return Ok(ApiResponse<object>.Fail("Failed to create membership plan"));
            }
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPlans()
        {
            var gymIdClaim = User.FindFirst("GymId")?.Value;

            if (string.IsNullOrEmpty(gymIdClaim))
                return Unauthorized(ApiResponse<object>.Fail("GymId not found"));

            int gymId = int.Parse(gymIdClaim);
            var result = await _service.GetAllPlansAsync(gymId);
            return Ok(result);
        }
    }

}