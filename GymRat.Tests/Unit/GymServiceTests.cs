using FluentAssertions;
using GymRat.DTOs.Gym;
using GymRat.Models;
using GymRat.Services;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Unit;

public class GymServiceTests : TestBase
{
  
    private static GymService BuildSut(GymRat.Data.AppDbContext db) =>
        new(db, BuildHasherMock().Object);

    private static Gym SeedGym(GymRat.Data.AppDbContext db,
        string name  = "Test Gym",
        string email = "gym@test.com",
        string slug  = "test-gym",
        string theme = "default")
    {
        var gym = new Gym
        {
            Name    = name,
            Email   = email,
            Phone   = "9999999999",
            Address = "Test Address",
            Slug    = slug,
            Theme   = theme,
        };
        db.Gyms.Add(gym);
        db.SaveChanges();
        return gym;
    }

    private static GymRegistrationDto BuildRegistrationDto(
        string gymName    = "FitZone Gym",
        string gymEmail   = "fitzone@gym.com",
        string adminEmail = "admin@gym.com") => new()
    {
        GymName     = gymName,
        GymEmail    = gymEmail,
        Phone       = "9999999999",
        Address     = "123 Main St",
        Description = "A great gym",
        AdminName   = "Admin User",
        AdminEmail  = adminEmail,
        Password    = "Admin123!",
    };

    // RegisterGymAsync

    [Fact]
    public async Task RegisterGym_WithValidData_ReturnsSuccess()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.RegisterGymAsync(BuildRegistrationDto());

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("registered");
    }

    [Fact]
    public async Task RegisterGym_WithValidData_SavesGymToDatabase()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        await sut.RegisterGymAsync(BuildRegistrationDto(gymEmail: "fitzone@gym.com"));

        db.Gyms.Should().ContainSingle(g => g.Email == "fitzone@gym.com");
    }

    [Fact]
    public async Task RegisterGym_WithValidData_SavesAdminUserToDatabase()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        await sut.RegisterGymAsync(BuildRegistrationDto(adminEmail: "admin@gym.com"));

        db.Users.Should().ContainSingle(u => u.Email == "admin@gym.com" && u.Role == "Admin");
    }

    [Fact]
    public async Task RegisterGym_WithValidData_GeneratesSlugFromGymName()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        await sut.RegisterGymAsync(BuildRegistrationDto(gymName: "FitZone Gym"));

        db.Gyms.Should().ContainSingle(g => g.Slug == "fitzone-gym");
    }

    [Fact]
    public async Task RegisterGym_WithValidData_SetsDefaultTheme()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        await sut.RegisterGymAsync(BuildRegistrationDto());

        db.Gyms.Should().ContainSingle(g => g.Theme == "default");
    }

    [Fact]
    public async Task RegisterGym_WithDuplicateGymEmail_ReturnsFail()
    {
        using var db = CreateDb();
        SeedGym(db, email: "fitzone@gym.com");
        var sut = BuildSut(db);

        var result = await sut.RegisterGymAsync(BuildRegistrationDto(gymEmail: "fitzone@gym.com"));

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Gym email already exists");
    }

    [Fact]
    public async Task RegisterGym_WithDuplicateAdminEmail_ReturnsFail()
    {
        using var db = CreateDb();
        db.Users.Add(new User
        {
            Name         = "Existing Admin",
            Email        = "admin@gym.com",
            PasswordHash = "hashed",
            Role         = "Admin",
            GymId        = 1,
        });
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.RegisterGymAsync(BuildRegistrationDto(adminEmail: "admin@gym.com"));

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Admin email already exists");
    }

    [Fact]
    public async Task RegisterGym_GymEmailIsCaseInsensitive_ReturnsFail()
    {
        using var db = CreateDb();
        SeedGym(db, email: "fitzone@gym.com");
        var sut = BuildSut(db);

        var result = await sut.RegisterGymAsync(BuildRegistrationDto(gymEmail: "FITZONE@GYM.COM"));

        result.IsSuccess.Should().BeFalse();
    }

    // GetMyGymAsync
   
    [Fact]
    public async Task GetMyGym_WithValidGymId_ReturnsGym()
    {
        using var db = CreateDb();
        var gym = SeedGym(db, name: "My Gym");
        var sut = BuildSut(db);

        var result = await sut.GetMyGymAsync(gym.Id);

        result.IsSuccess.Should().BeTrue();
        result.Data.Name.Should().Be("My Gym");
        result.Data.Id.Should().Be(gym.Id);
    }

    [Fact]
    public async Task GetMyGym_WithInvalidGymId_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.GetMyGymAsync(9999);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // UpdateGymAsync
   

    [Fact]
    public async Task UpdateGym_WithValidData_UpdatesName()
    {
        using var db = CreateDb();
        var gym = SeedGym(db, name: "Old Name");
        var sut = BuildSut(db);

        var result = await sut.UpdateGymAsync(gym.Id, new UpdateGymDto { Name = "New Name" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Name.Should().Be("New Name");
    }

    [Fact]
    public async Task UpdateGym_WithValidData_UpdatesPhone()
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        var result = await sut.UpdateGymAsync(gym.Id, new UpdateGymDto { Phone = "1111111111" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Phone.Should().Be("1111111111");
    }

    [Fact]
    public async Task UpdateGym_WithNullName_DoesNotOverwriteExistingName()
    {
        using var db = CreateDb();
        var gym = SeedGym(db, name: "Keep This Name");
        var sut = BuildSut(db);

        var result = await sut.UpdateGymAsync(gym.Id, new UpdateGymDto { Description = "New desc" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Name.Should().Be("Keep This Name");
    }

    [Fact]
    public async Task UpdateGym_WithInvalidGymId_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.UpdateGymAsync(9999, new UpdateGymDto { Name = "New Name" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

  
    // UpdateThemeAsync
    
    [Theory]
    [InlineData("default")]
    [InlineData("dark")]
    [InlineData("blue")]
    [InlineData("green")]
    [InlineData("red")]
    public async Task UpdateTheme_WithValidTheme_ReturnsSuccess(string theme)
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        var result = await sut.UpdateThemeAsync(gym.Id, new UpdateThemeDto { Theme = theme });

        result.IsSuccess.Should().BeTrue();
        result.Data.Theme.Should().Be(theme);
    }

    [Fact]
    public async Task UpdateTheme_WithInvalidTheme_ReturnsFail()
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        var result = await sut.UpdateThemeAsync(gym.Id, new UpdateThemeDto { Theme = "purple" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid theme");
    }

    [Fact]
    public async Task UpdateTheme_ThemeIsCaseInsensitive_ReturnsSuccess()
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        var result = await sut.UpdateThemeAsync(gym.Id, new UpdateThemeDto { Theme = "DARK" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Theme.Should().Be("dark");
    }

    [Fact]
    public async Task UpdateTheme_WithInvalidGymId_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.UpdateThemeAsync(9999, new UpdateThemeDto { Theme = "dark" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }


    [Fact]
    public async Task GetBySlug_WithValidSlug_ReturnsGym()
    {
        using var db = CreateDb();
        SeedGym(db, name: "Slug Gym", slug: "slug-gym");
        var sut = BuildSut(db);

        var result = await sut.GetBySlugAsync("slug-gym");

        result.IsSuccess.Should().BeTrue();
        result.Data.Slug.Should().Be("slug-gym");
        result.Data.Name.Should().Be("Slug Gym");
    }

    [Fact]
    public async Task GetBySlug_WithInvalidSlug_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.GetBySlugAsync("does-not-exist");

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task GetBySlug_IncludesMembershipPlans()
    {
        using var db = CreateDb();
        var gym = SeedGym(db, slug: "my-gym");
        db.MembershipPlans.Add(new MembershipPlan
        {
            GymId          = gym.Id,
            Name           = "Monthly",
            Price          = 1000,
            DurationInDays = 30,
        });
        db.SaveChanges();

        var sut = BuildSut(db);
        var result = await sut.GetBySlugAsync("my-gym");

        result.IsSuccess.Should().BeTrue();
        result.Data.Plans.Should().HaveCount(1);
        result.Data.Plans[0].Name.Should().Be("Monthly");
    }

   

    [Fact]
    public async Task DeleteGym_WithValidGymId_ReturnsSuccess()
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        var result = await sut.DeleteGymAsync(gym.Id);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("deleted");
    }

    [Fact]
    public async Task DeleteGym_WithValidGymId_RemovesGymFromDatabase()
    {
        using var db = CreateDb();
        var gym = SeedGym(db);
        var sut = BuildSut(db);

        await sut.DeleteGymAsync(gym.Id);

        db.Gyms.Should().BeEmpty();
    }

    [Fact]
    public async Task DeleteGym_WithInvalidGymId_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.DeleteGymAsync(9999);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}