namespace GymRat.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int MemberSubscriptionId { get; set; }
        public MemberSubscription? MemberSubscription { get; set; }

        public int GymId { get; set; }
        public Gym? Gym { get; set; }

        public decimal Amount { get; set; }

        public string Status { get; set; } = "Pending";
        // Pending, Paid, Failed, Refunded

        public string PaymentMethod { get; set; } = "FakeGateway";

        public string? TransactionId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? PaidAt { get; set; }
    }
}