namespace GymRat.DTOs
{
    public class CreateMembershipPlanDto
    {
        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int DurationInDays { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}