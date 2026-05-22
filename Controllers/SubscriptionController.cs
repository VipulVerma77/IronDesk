using System.Security.Claims;
using GymRat.DTOs;
using GymRat.DTOs.Subscription;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue("UserId")!);

        [HttpPost("public/subscribe")]
        [AllowAnonymous]
        public async Task<IActionResult> PublicSubscribe([FromQuery] string slug, [FromBody] SubscribeRequestDto dto)
        {
           
            if (string.IsNullOrWhiteSpace(slug))
                return BadRequest(ApiResponse<object>.Fail("Gym slug is required."));

            if (dto == null)
                return BadRequest(ApiResponse<object>.Fail("Request body cannot be empty."));

            // if (!ModelState.IsValid)
            //     return BadRequest(ApiResponse<object>.Fail(ModelState));

            var result = await _subscriptionService.PublicSubscribeAsync(slug, dto);
            return Ok(result);
        }


        [HttpPost("admin/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminAssign([FromBody] AdminAssignSubscriptionDto dto)
        {
            var gymId = GetGymId();
            if (gymId <= 0)
                return BadRequest("Invalid gymId.");

            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            if (dto.MemberId <= 0)
                return BadRequest("Invalid MemberId.");

            if (dto.MembershipPlanId <= 0)
                return BadRequest("Invalid PlanId.");

            var result = await _subscriptionService.AdminAssignSubscriptionAsync(dto, gymId);
            return Ok(result);
        }


        [HttpGet("admin/pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingSubscriptions(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var gymId = GetGymId();
            if (gymId <= 0)
                return BadRequest(ApiResponse<object>.Fail("GymId is required."));

            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0 || pageSize > 50) pageSize = 10;

            var result = await _subscriptionService.GetPendingSubscriptionsAsync(gymId, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllSubscriptions(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] int? memberId = null,
            [FromQuery] int? membershipPlanId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? search = null,
            [FromQuery] bool? isExpired = null,
            [FromQuery] string sortBy = "CreatedAt",
            [FromQuery] string sortOrder = "desc")
        {
            var gymId = GetGymId();
            if (gymId <= 0)
                return BadRequest("Invalid gymId.");

            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0 || pageSize > 50) pageSize = 10;

            var result = await _subscriptionService.GetAllSubscriptionsAsync(
                gymId,
                pageNumber,
                pageSize,
                status,
                memberId,
                membershipPlanId,
                fromDate,
                toDate,
                search,
                isExpired,
                sortBy,
                sortOrder
            );

            return Ok(result);
        }


        // =====================================================
        // ADMIN: CANCEL SUBSCRIPTION
        // =====================================================

        [HttpPost("admin/cancel/{subscriptionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelSubscription(int subscriptionId)
        {
            var gymId = GetGymId();
            if (subscriptionId <= 0)
                return BadRequest(ApiResponse<object>.Fail("Invalid Subscription."));

            if (gymId <= 0)
                return BadRequest(ApiResponse<object>.Fail("Gym Id is required."));

            var result = await _subscriptionService.CancelSubscriptionAsync(subscriptionId, gymId);
            return Ok(result);
        }


        [HttpGet("my")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> GetMySubscriptions(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var gymId = GetGymId();
            var userId = GetUserId();
            
            if (userId <= 0)
                return BadRequest(ApiResponse<object>.Fail("User Id is required."));

            if (gymId <= 0)
                return BadRequest(ApiResponse<object>.Fail("Gym Id is required."));

            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0 || pageSize > 50) pageSize = 10;

            var result = await _subscriptionService.GetMySubscriptionsAsync(userId, gymId, pageNumber, pageSize);
            return Ok(result);
        }
    }
}