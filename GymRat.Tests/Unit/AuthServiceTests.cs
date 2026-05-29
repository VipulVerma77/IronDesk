using FluentAssertions;
using GymRat.DTOs;
using GymRat.DTOs.Auth;
using GymRat.Models;
using GymRat.Services;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Unit;

public class AuthServiceTests : TestBase
{
   

    private static AuthService BuildSut(GymRat.Data.AppDbContext db) =>
        new(db, BuildTokenMock().Object, BuildHasherMock().Object);

    private static User SeedUser(GymRat.Data.AppDbContext db,
        string email    = "test@gym.com",
        string name     = "Test User",
        string role     = "Member",
        int gymId       = 1,
        bool isDeleted  = false)
    {
        var user = new User
        {
            Name         = name,
            Email        = email,
            PasswordHash = "hashed-password",
            Role         = role,
            GymId        = gymId,
            IsDeleted    = isDeleted,
            DeletedAt    = isDeleted ? DateTime.UtcNow : null,
        };
        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccess()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice",
            Email    = "alice@gym.com",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeTrue();
        result.Data.Email.Should().Be("alice@gym.com");
        result.Data.Name.Should().Be("Alice");
    }

    [Fact]
    public async Task Register_WithValidData_SavesUserToDatabase()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice",
            Email    = "alice@gym.com",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        db.Users.Should().ContainSingle(u => u.Email == "alice@gym.com");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsFail()
    {
        using var db = CreateDb();
        SeedUser(db, email: "alice@gym.com");
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice Again",
            Email    = "alice@gym.com",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task Register_WithEmptyEmail_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice",
            Email    = "",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task Register_WithEmptyPassword_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice",
            Email    = "alice@gym.com",
            Password = "",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task Register_WithEmptyName_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "",
            Email    = "alice@gym.com",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task Register_EmailIsCaseInsensitive_ReturnsFail()
    {
        using var db = CreateDb();
        SeedUser(db, email: "alice@gym.com");
        var sut = BuildSut(db);

        var result = await sut.RegisterAsync(new RegisterDto
        {
            Name     = "Alice",
            Email    = "ALICE@GYM.COM",
            Password = "password123",
            Role     = "Member",
        }, gymId: 1);

        result.IsSuccess.Should().BeFalse();
    }


    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsSuccessWithTokens()
    {
        using var db = CreateDb();
        SeedUser(db, email: "bob@gym.com");
        var sut = BuildSut(db);

        var result = await sut.LoginAsync(new LoginDto
        {
            Email    = "bob@gym.com",
            Password = "correct-old-password",
        });

        result.IsSuccess.Should().BeTrue();
        result.Data.AccessToken.Should().Be("fake-access-token");
        result.Data.RefreshToken.Should().Be("fake-refresh-token");
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsFail()
    {
        using var db = CreateDb();
        SeedUser(db, email: "bob@gym.com");
        var sut = BuildSut(db);

        var result = await sut.LoginAsync(new LoginDto
        {
            Email    = "bob@gym.com",
            Password = "wrong-old-password",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid email or password");
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.LoginAsync(new LoginDto
        {
            Email    = "nobody@gym.com",
            Password = "correct-old-password",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid email or password");
    }

    [Fact]
    public async Task Login_WithSoftDeletedUser_ReturnsFail()
    {
        using var db = CreateDb();
        SeedUser(db, email: "deleted@gym.com", isDeleted: true);
        var sut = BuildSut(db);

        var result = await sut.LoginAsync(new LoginDto
        {
            Email    = "deleted@gym.com",
            Password = "correct-old-password",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("deactivated");
    }

    [Fact]
    public async Task Login_WithEmptyEmail_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.LoginAsync(new LoginDto
        {
            Email    = "",
            Password = "correct-old-password",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task Login_SavesRefreshTokenToDatabase()
    {
        using var db = CreateDb();
        SeedUser(db, email: "bob@gym.com");
        var sut = BuildSut(db);

        await sut.LoginAsync(new LoginDto
        {
            Email    = "bob@gym.com",
            Password = "correct-old-password",
        });

        db.RefreshTokens.Should().ContainSingle(rt => rt.Token == "fake-refresh-token");
    }


    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsNewTokens()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        db.RefreshTokens.Add(new RefreshToken
        {
            Token     = "valid-token",
            UserId    = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
        });
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.RefreshTokenAsync("valid-token");

        result.IsSuccess.Should().BeTrue();
        result.Data.AccessToken.Should().Be("fake-access-token");
        result.Data.RefreshToken.Should().Be("fake-refresh-token");
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_RevokesOldToken()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var oldToken = new RefreshToken
        {
            Token     = "old-token",
            UserId    = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.RefreshTokens.Add(oldToken);
        db.SaveChanges();

        var sut = BuildSut(db);
        await sut.RefreshTokenAsync("old-token");

        oldToken.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task RefreshToken_WithRevokedToken_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        db.RefreshTokens.Add(new RefreshToken
        {
            Token     = "revoked-token",
            UserId    = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = true,
            CreatedAt = DateTime.UtcNow,
        });
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.RefreshTokenAsync("revoked-token");

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("revoked");
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        db.RefreshTokens.Add(new RefreshToken
        {
            Token     = "expired-token",
            UserId    = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow.AddDays(-8),
        });
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.RefreshTokenAsync("expired-token");

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("expired");
    }

    [Fact]
    public async Task RefreshToken_WithUnknownToken_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RefreshTokenAsync("does-not-exist");

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid");
    }

    [Fact]
    public async Task RefreshToken_WithNullToken_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RefreshTokenAsync(null);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

   

    [Fact]
    public async Task Logout_WithValidToken_RevokesToken()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var token = new RefreshToken
        {
            Token     = "logout-token",
            UserId    = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.RefreshTokens.Add(token);
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.LogoutAsync("logout-token");

        result.IsSuccess.Should().BeTrue();
        token.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task Logout_WithNullToken_StillReturnsSuccess()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.LogoutAsync(null);

        result.IsSuccess.Should().BeTrue();
    }


    [Fact]
    public async Task GetProfile_WithValidUserId_ReturnsProfile()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "John", email: "john@gym.com");
        var sut = BuildSut(db);

        var result = await sut.GetProfileAsync(user.Id);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task GetProfile_WithUnknownUserId_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.GetProfileAsync(9999);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}