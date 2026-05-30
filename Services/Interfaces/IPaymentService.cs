using GymRat.DTOs;
using GymRat.DTOs.Payment;

namespace GymRat.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<ApiResponse<PaymentResponseDto>> MarkPaymentPaidAsync(int paymentId, int gymId);

        Task<ApiResponse<ListResponse<PaymentResponseDto>>> GetAllPaymentsAsync(int gymId,int pageNumber,int pageSize);
    }
}