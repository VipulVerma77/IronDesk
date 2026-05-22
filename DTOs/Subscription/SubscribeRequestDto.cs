namespace GymRat.DTOs.Subscription
{
    public class SubscribeRequestDto
    {
        public int MembershipPlanId { get; set; }
 
        // Only used in FLOW 1 (public self-subscribe)
        // If user is already logged in, skip these
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Phone { get; set; }
        public DateTime? StartDate { get; set; }
    }
}