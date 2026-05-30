using System.Security.Claims;
using GymRat.DTOs.Payment;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymRat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        private int GetGymId() => int.Parse(User.FindFirstValue("GymId")!);


        [HttpPost("mark-paid")]
        public async Task<IActionResult> MarkPaid([FromBody] MarkPaymentDto dto)
        {
            if (dto.PaymentId <= 0)
                return BadRequest("Invalid paymentId.");

            var gymId = GetGymId();

            var result = await _paymentService.MarkPaymentPaidAsync(dto.PaymentId, gymId);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPayments([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var gymId = GetGymId();

            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0 || pageSize > 50) pageSize = 10;

            var result = await _paymentService.GetAllPaymentsAsync(gymId, pageNumber, pageSize);

            return Ok(result);
        }
    }
}