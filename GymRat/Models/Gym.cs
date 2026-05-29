namespace GymRat.Models
{
    public class Gym
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public required string Slug { get; set; }
        public string? Description { get; set; }      
        public string? LogoPath { get; set; }         
        public string Theme { get; set; } = "default"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Member> Members { get; set; } = new List<Member>();
        public ICollection<MembershipPlan> MembershipPlans { get; set; } = new List<MembershipPlan>();
        public ICollection<MemberSubscription> MemberSubscriptions { get; set; } = new List<MemberSubscription>();
    }
}