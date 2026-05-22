namespace GymRat.DTOs.Gym
{
    public class GymRegistrationDto
    {
        public required string GymName { get; set; }
        public required string GymEmail { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public string? Description { get; set; }

        public required string AdminName { get; set; }
        public required string AdminEmail { get; set; }
        public required string Password { get; set; }
    }
}