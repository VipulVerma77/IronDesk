using GymRat.Data;
using GymRat.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace GymRat.Tests.Helpers;

public abstract class TestBase
{
    
    protected static AppDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    protected static Mock<IPasswordHasher> BuildHasherMock()
    {
        var hasher = new Mock<IPasswordHasher>();

        hasher.Setup(h => h.HashPassword(It.IsAny<string>()))
              .Returns("new-hashed-password");

        hasher.Setup(h => h.VerifyPassword("correct-old-password", "hashed-password"))
              .Returns(true);

        hasher.Setup(h => h.VerifyPassword("wrong-old-password", "hashed-password"))
              .Returns(false);

        return hasher;
    }


    protected static Mock<ITokenService> BuildTokenMock()
    {
        var token = new Mock<ITokenService>();

        token.Setup(t => t.GenerateAccessToken(It.IsAny<GymRat.Models.User>()))
             .Returns("fake-access-token");

        token.Setup(t => t.GenerateRefreshToken())
             .Returns("fake-refresh-token");

        return token;
    }
}