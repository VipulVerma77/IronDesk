using FluentAssertions;
using GymRat.DTOs.Attendance;
using GymRat.Models;
using GymRat.Services;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Unit;

public class AttendanceServiceTests : TestBase
{
    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    private static AttendanceService BuildSut(GymRat.Data.AppDbContext db) =>
        new(db);

    private static Gym SeedGym(GymRat.Data.AppDbContext db, int id = 1)
    {
        var gym = new Gym
        {
            Id      = id,
            Name    = "Test Gym",
            Email   = "gym@test.com",
            Phone   = "9999999999",
            Address = "Test Address",
            Slug    = "test-gym",
        };
        db.Gyms.Add(gym);
        db.SaveChanges();
        return gym;
    }

    private static Member SeedMember(GymRat.Data.AppDbContext db,
        int gymId = 1, string status = "Active",
        string email = "member@test.com")
    {
        var user = new User
        {
            Name         = "Test Member",
            Email        = email,
            PasswordHash = "hashed",
            Role         = "Member",
            GymId        = gymId,
        };
        db.Users.Add(user);
        db.SaveChanges();

        var member = new Member
        {
            FullName = "Test Member",
            Email    = email,
            Phone    = "9999999999",
            Address  = "Test Address",
            JoinDate = DateTime.UtcNow,
            Status   = status,
            GymId    = gymId,
            UserId   = user.Id,
        };
        db.Members.Add(member);
        db.SaveChanges();
        return member;
    }

    private static Attendance SeedAttendance(GymRat.Data.AppDbContext db,
        Member member,
        DateTime? checkIn  = null,
        DateTime? checkOut = null,
        DateOnly? date     = null)
    {
        var checkInTime = checkIn ?? DateTime.UtcNow;
        var attendance = new Attendance
        {
            MemberId     = member.Id,
            Member       = member,
            GymId        = member.GymId,
            CheckInTime  = checkInTime,
            CheckOutTime = checkOut,
            Date         = date ?? DateOnly.FromDateTime(checkInTime),
        };
        db.Attendances.Add(attendance);
        db.SaveChanges();
        return attendance;
    }

    // ─────────────────────────────────────────
    // CheckInAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task CheckIn_ActiveMember_ReturnsSuccess()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Active");
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("Check-in successful");
    }

    [Fact]
    public async Task CheckIn_ActiveMember_CreatesAttendanceRecord()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Active");
        var sut      = BuildSut(db);

        await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        db.Attendances.Should().ContainSingle(a => a.MemberId == member.Id);
    }

    [Fact]
    public async Task CheckIn_ActiveMember_CheckOutTimeIsNull()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Active");
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.Data.CheckOutTime.Should().BeNull();
    }

    [Fact]
    public async Task CheckIn_InactiveMember_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Inactive");
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not active");
    }

    [Fact]
    public async Task CheckIn_BlockedMember_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Blocked");
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not active");
    }

    [Fact]
    public async Task CheckIn_WhenAlreadyCheckedInToday_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Active");
        // open check-in (no checkout)
        SeedAttendance(db, member, checkOut: null);
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("already checked in");
    }

    [Fact]
    public async Task CheckIn_AfterCheckOut_AllowsSecondCheckInSameDay()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id, status: "Active");
        // closed check-in (has checkout)
        SeedAttendance(db, member, checkOut: DateTime.UtcNow.AddHours(-1));
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeTrue();
        db.Attendances.Count(a => a.MemberId == member.Id).Should().Be(2);
    }

    [Fact]
    public async Task CheckIn_MemberFromDifferentGym_ReturnsFail()
    {
        using var db = CreateDb();
        var gymA     = SeedGym(db, id: 1);
        var gymB     = SeedGym(db, id: 2);
        var member   = SeedMember(db, gymId: gymA.Id, status: "Active");
        var sut      = BuildSut(db);

        // gymB tries to check in gymA member
        var result = await sut.CheckInAsync(gymB.Id,
            new CheckInRequestDto { MemberId = member.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task CheckIn_UnknownMember_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.CheckInAsync(gym.Id,
            new CheckInRequestDto { MemberId = 9999 });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // ─────────────────────────────────────────
    // CheckOutAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task CheckOut_WithOpenRecord_ReturnsSuccess()
    {
        using var db   = CreateDb();
        var gym        = SeedGym(db);
        var member     = SeedMember(db, gymId: gym.Id, status: "Active");
        var attendance = SeedAttendance(db, member, checkOut: null);
        var sut        = BuildSut(db);

        var result = await sut.CheckOutAsync(gym.Id,
            new CheckOutRequestDto { AttendanceId = attendance.Id });

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("Check-out successful");
    }

    [Fact]
    public async Task CheckOut_WithOpenRecord_SetsCheckOutTime()
    {
        using var db   = CreateDb();
        var gym        = SeedGym(db);
        var member     = SeedMember(db, gymId: gym.Id, status: "Active");
        var attendance = SeedAttendance(db, member, checkOut: null);
        var sut        = BuildSut(db);

        await sut.CheckOutAsync(gym.Id,
            new CheckOutRequestDto { AttendanceId = attendance.Id });

        attendance.CheckOutTime.Should().NotBeNull();
        attendance.CheckOutTime!.Value
            .Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task CheckOut_WhenAlreadyCheckedOut_ReturnsFail()
    {
        using var db   = CreateDb();
        var gym        = SeedGym(db);
        var member     = SeedMember(db, gymId: gym.Id, status: "Active");
        var attendance = SeedAttendance(db, member,
            checkOut: DateTime.UtcNow.AddHours(-1));
        var sut        = BuildSut(db);

        var result = await sut.CheckOutAsync(gym.Id,
            new CheckOutRequestDto { AttendanceId = attendance.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("already checked out");
    }

    [Fact]
    public async Task CheckOut_WithInvalidAttendanceId_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.CheckOutAsync(gym.Id,
            new CheckOutRequestDto { AttendanceId = 9999 });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task CheckOut_FromDifferentGym_ReturnsFail()
    {
        using var db   = CreateDb();
        var gymA       = SeedGym(db, id: 1);
        var gymB       = SeedGym(db, id: 2);
        var member     = SeedMember(db, gymId: gymA.Id, status: "Active");
        var attendance = SeedAttendance(db, member, checkOut: null);
        var sut        = BuildSut(db);

        // gymB tries to checkout gymA attendance
        var result = await sut.CheckOutAsync(gymB.Id,
            new CheckOutRequestDto { AttendanceId = attendance.Id });

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // ─────────────────────────────────────────
    // GetTodayAttendanceAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetToday_ReturnsOnlyTodaysRecords()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id);
        var today    = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        SeedAttendance(db, member, date: today);     // today
        SeedAttendance(db, member, date: yesterday); // yesterday
        var sut = BuildSut(db);

        var result = await sut.GetTodayAttendanceAsync(gym.Id, 1, 10);

        result.IsSuccess.Should().BeTrue();
        result.Data.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task GetToday_PaginationWorks()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id);
        var today    = DateOnly.FromDateTime(DateTime.UtcNow);

        for (int i = 0; i < 5; i++)
            SeedAttendance(db, member, date: today);

        var sut = BuildSut(db);
        var result = await sut.GetTodayAttendanceAsync(gym.Id, 1, 2);

        result.Data.Data.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(5);
        result.Data.TotalPages.Should().Be(3);
    }

    // ─────────────────────────────────────────
    // GetAttendanceByMemberAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetByMember_WithValidMember_ReturnsAllRecords()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var member   = SeedMember(db, gymId: gym.Id);

        SeedAttendance(db, member);
        SeedAttendance(db, member);
        var sut = BuildSut(db);

        var result = await sut.GetAttendanceByMemberAsync(gym.Id, member.Id, 1, 10);

        result.IsSuccess.Should().BeTrue();
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetByMember_WithInvalidMember_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.GetAttendanceByMemberAsync(gym.Id, 9999, 1, 10);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task GetByMember_FromDifferentGym_ReturnsFail()
    {
        using var db = CreateDb();
        var gymA     = SeedGym(db, id: 1);
        var gymB     = SeedGym(db, id: 2);
        var member   = SeedMember(db, gymId: gymA.Id);
        var sut      = BuildSut(db);

        // gymB tries to get gymA member attendance
        var result = await sut.GetAttendanceByMemberAsync(gymB.Id, member.Id, 1, 10);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // ─────────────────────────────────────────
    // GetAttendanceByDateRangeAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetByDateRange_ReturnsRecordsWithinRange()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var member    = SeedMember(db, gymId: gym.Id);
        var today     = DateTime.UtcNow.Date;

        SeedAttendance(db, member, date: DateOnly.FromDateTime(today));
        SeedAttendance(db, member, date: DateOnly.FromDateTime(today.AddDays(-1)));
        SeedAttendance(db, member, date: DateOnly.FromDateTime(today.AddDays(-10))); // outside range
        var sut = BuildSut(db);

        var result = await sut.GetAttendanceByDateRangeAsync(
            gym.Id,
            fromDate: today.AddDays(-2),
            toDate: today,
            pageNumber: 1,
            pageSize: 10);

        result.IsSuccess.Should().BeTrue();
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetByDateRange_WhenFromDateGreaterThanToDate_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.GetAttendanceByDateRangeAsync(
            gym.Id,
            fromDate: DateTime.UtcNow.Date,
            toDate: DateTime.UtcNow.Date.AddDays(-5), // toDate before fromDate
            pageNumber: 1,
            pageSize: 10);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("fromDate cannot be greater than toDate");
    }

    [Fact]
    public async Task GetByDateRange_PageSizeExceeds50_ClampsTo50()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.GetAttendanceByDateRangeAsync(
            gym.Id,
            fromDate: DateTime.UtcNow.Date.AddDays(-30),
            toDate: DateTime.UtcNow.Date,
            pageNumber: 1,
            pageSize: 100);

        result.IsSuccess.Should().BeTrue();
        result.Data.PageSize.Should().Be(50);
    }
}