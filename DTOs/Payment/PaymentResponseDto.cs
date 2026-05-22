namespace GymRat.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }

        public int MemberSubscriptionId { get; set; }

        public decimal Amount { get; set; }

        public string Status { get; set; }

        public string PaymentMethod { get; set; }

        public string? TransactionId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? PaidAt { get; set; }
    }
}