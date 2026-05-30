namespace GymRat.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        // Used when token comes from body (not cookie)
        public string? RefreshToken { get; set; }
    }
}