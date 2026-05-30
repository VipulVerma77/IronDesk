namespace GymRat.DTOs.Subscription
{
    public class AdminAssignSubscriptionDto
    {
        public int MemberId { get; set; }
        public int MembershipPlanId { get; set; }

        public DateTime? StartDate { get; set; }
    }
}