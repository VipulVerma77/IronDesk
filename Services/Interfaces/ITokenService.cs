using GymRat.Models;
namespace GymRat.Services.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
    }
}