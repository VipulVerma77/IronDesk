namespace GymRat.DTOs.Auth
{
    public class AuthResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;

        // Only populated when client prefers body over cookie
        public string? RefreshToken { get; set; }
    }
}