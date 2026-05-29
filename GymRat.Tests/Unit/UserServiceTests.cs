using FluentAssertions;
using GymRat.DTOs.User;
using GymRat.Models;
using GymRat.Services;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Unit;

public class UserServiceTests : TestBase
{
    private static UserService BuildSut(GymRat.Data.AppDbContext db) =>
        new(db, BuildHasherMock().Object);

    private static User SeedUser(GymRat.Data.AppDbContext db,
        string name    = "Test User",
        string email   = "user@test.com",
        string role    = "Member",
        int gymId      = 1,
        bool isDeleted = false)
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

    private static Member SeedMember(GymRat.Data.AppDbContext db, User user, int gymId = 1)
    {
        var member = new Member
        {
            FullName = user.Name,
            Email    = user.Email,
            Phone    = "9999999999",
            Address  = "Test Address",
            JoinDate = DateTime.UtcNow,
            Status   = "Active",
            GymId    = gymId,
            User     = user,
        };
        db.Members.Add(member);
        db.SaveChanges();
        return member;
    }

    private static RefreshToken SeedToken(GymRat.Data.AppDbContext db, User user, bool isRevoked = false)
    {
        var token = new RefreshToken
        {
            User      = user,
            Token     = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = isRevoked,
        };
        db.RefreshTokens.Add(token);
        db.SaveChanges();
        return token;
    }

    // UpdateProfileAsync

    [Fact]
    public async Task UpdateProfile_WithValidName_UpdatesUserName()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "Old Name");
        var sut = BuildSut(db);

        var result = await sut.UpdateProfileAsync(user.Id, new UpdateProfileDto { Name = "New Name" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Name.Should().Be("New Name");
    }

    [Fact]
    public async Task UpdateProfile_WithValidName_SyncsMemberFullName()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "Old Name");
        var member = SeedMember(db, user);
        var sut = BuildSut(db);

        await sut.UpdateProfileAsync(user.Id, new UpdateProfileDto { Name = "New Name" });

        member.FullName.Should().Be("New Name");
    }

    [Fact]
    public async Task UpdateProfile_WithValidPhone_SyncsMemberPhone()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var member = SeedMember(db, user);
        var sut = BuildSut(db);

        await sut.UpdateProfileAsync(user.Id, new UpdateProfileDto { Phone = "1111111111" });

        member.Phone.Should().Be("1111111111");
    }

    [Fact]
    public async Task UpdateProfile_WithNullName_DoesNotOverwriteExistingName()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "Keep This Name");
        var sut = BuildSut(db);

        await sut.UpdateProfileAsync(user.Id, new UpdateProfileDto { Phone = "1111111111" });

        user.Name.Should().Be("Keep This Name");
    }

    [Fact]
    public async Task UpdateProfile_WithDeletedUser_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, isDeleted: true);
        var sut = BuildSut(db);

        var result = await sut.UpdateProfileAsync(user.Id, new UpdateProfileDto { Name = "New Name" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateProfile_WithUnknownUser_ReturnsFail()
    {
        using var db = CreateDb();
        var sut = BuildSut(db);

        var result = await sut.UpdateProfileAsync(9999, new UpdateProfileDto { Name = "Ghost" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // ─────────────────────────────────────────
    // ChangePasswordAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task ChangePassword_WithCorrectOldPassword_ReturnsSuccess()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "NewPass123!",
        });

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task ChangePassword_WithCorrectOldPassword_UpdatesPasswordHash()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "NewPass123!",
        });

        user.PasswordHash.Should().Be("new-hashed-password");
    }

    [Fact]
    public async Task ChangePassword_WithCorrectOldPassword_RevokesAllRefreshTokens()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var t1 = SeedToken(db, user);
        var t2 = SeedToken(db, user);
        var sut = BuildSut(db);

        await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "NewPass123!",
        });

        t1.IsRevoked.Should().BeTrue();
        t2.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task ChangePassword_WithWrongOldPassword_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "wrong-old-password",
            NewPassword = "NewPass123!",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("incorrect");
    }

    [Fact]
    public async Task ChangePassword_WhenNewPasswordSameAsOld_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "correct-old-password",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("same");
    }

    [Fact]
    public async Task ChangePassword_WithShortNewPassword_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "abc",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("6 characters");
    }

    [Fact]
    public async Task ChangePassword_WithEmptyFields_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "",
            NewPassword = "NewPass123!",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task ChangePassword_WithDeletedUser_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, isDeleted: true);
        var sut = BuildSut(db);

        var result = await sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            OldPassword = "correct-old-password",
            NewPassword = "NewPass123!",
        });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // AdminDeleteUserAsync

    [Fact]
    public async Task AdminDeleteUser_WithValidUser_ReturnsSuccess()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminDeleteUserAsync(user.Id, gymId: 1);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("deactivated");
    }

    [Fact]
    public async Task AdminDeleteUser_WithValidUser_SetsIsDeleted()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        await sut.AdminDeleteUserAsync(user.Id, gymId: 1);

        user.IsDeleted.Should().BeTrue();
        user.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task AdminDeleteUser_WithValidUser_RevokesAllRefreshTokens()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var t1 = SeedToken(db, user);
        var t2 = SeedToken(db, user);
        var sut = BuildSut(db);

        await sut.AdminDeleteUserAsync(user.Id, gymId: 1);

        t1.IsRevoked.Should().BeTrue();
        t2.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task AdminDeleteUser_WhenUserIsAdmin_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Admin", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminDeleteUserAsync(user.Id, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Cannot delete an admin");
    }

    [Fact]
    public async Task AdminDeleteUser_FromDifferentGym_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminDeleteUserAsync(user.Id, gymId: 2);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task AdminDeleteUser_AlreadyDeletedUser_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1, isDeleted: true);
        var sut = BuildSut(db);

        var result = await sut.AdminDeleteUserAsync(user.Id, gymId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // AdminUpdateUserAsync
   
    [Fact]
    public async Task AdminUpdateUser_WithValidData_UpdatesUserName()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "Old Name", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminUpdateUserAsync(user.Id, gymId: 1,
            new UpdateProfileDto { Name = "New Name" });

        result.IsSuccess.Should().BeTrue();
        result.Data.Name.Should().Be("New Name");
    }

    [Fact]
    public async Task AdminUpdateUser_WithValidData_SyncsMemberRecord()
    {
        using var db = CreateDb();
        var user = SeedUser(db, name: "Old Name", gymId: 1);
        var member = SeedMember(db, user, gymId: 1);
        var sut = BuildSut(db);

        await sut.AdminUpdateUserAsync(user.Id, gymId: 1,
            new UpdateProfileDto { Name = "New Name", Phone = "1111111111" });

        member.FullName.Should().Be("New Name");
        member.Phone.Should().Be("1111111111");
    }

    [Fact]
    public async Task AdminUpdateUser_FromDifferentGym_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminUpdateUserAsync(user.Id, gymId: 2,
            new UpdateProfileDto { Name = "Hacked Name" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task AdminUpdateUser_DeletedUser_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, gymId: 1, isDeleted: true);
        var sut = BuildSut(db);

        var result = await sut.AdminUpdateUserAsync(user.Id, gymId: 1,
            new UpdateProfileDto { Name = "New Name" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // AdminResetPasswordAsync
    

    [Fact]
    public async Task AdminResetPassword_WithValidData_ReturnsSuccess()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "NewPass123!" });

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("reset");
    }

    [Fact]
    public async Task AdminResetPassword_WithValidData_UpdatesPasswordHash()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "NewPass123!" });

        user.PasswordHash.Should().Be("new-hashed-password");
    }

    [Fact]
    public async Task AdminResetPassword_WithValidData_RevokesAllRefreshTokens()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var token = SeedToken(db, user);
        var sut = BuildSut(db);

        await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "NewPass123!" });

        token.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task AdminResetPassword_WhenUserIsAdmin_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Admin", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "NewPass123!" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Cannot reset admin");
    }

    [Fact]
    public async Task AdminResetPassword_WithShortPassword_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "abc" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("6 characters");
    }

    [Fact]
    public async Task AdminResetPassword_WithEmptyPassword_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminResetPasswordAsync(user.Id, gymId: 1,
            new ResetPasswordDto { NewPassword = "" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("required");
    }

    [Fact]
    public async Task AdminResetPassword_FromDifferentGym_ReturnsFail()
    {
        using var db = CreateDb();
        var user = SeedUser(db, role: "Member", gymId: 1);
        var sut = BuildSut(db);

        var result = await sut.AdminResetPasswordAsync(user.Id, gymId: 2,
            new ResetPasswordDto { NewPassword = "NewPass123!" });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}