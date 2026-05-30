namespace GymRat.Models
{
    public class MemberSubscription
    {
        public int Id { get; set; }

        public int MemberId { get; set; }
        public Member Member { get; set; }

        public int MembershipPlanId { get; set; }
        public MembershipPlan MembershipPlan { get; set; }


        public int GymId { get; set; }
        public Gym Gym { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}