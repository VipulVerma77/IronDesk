namespace GymRat.DTOs.Gym
{
    // What public slug endpoint returns
    public class PublicGymResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoPath { get; set; }
        public string Theme { get; set; } = "default";
        public string Slug { get; set; } = string.Empty;
        public List<PublicPlanDto> Plans { get; set; } = new();
    }

    public class PublicPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationInDays { get; set; }
        public string? Description { get; set; }
    }
}