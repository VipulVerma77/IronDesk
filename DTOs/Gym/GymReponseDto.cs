namespace GymRat.DTOs.Gym
{
    public class GymResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoPath { get; set; }
        public string Theme { get; set; } = "default";
        public DateTime CreatedAt { get; set; }
    }
}