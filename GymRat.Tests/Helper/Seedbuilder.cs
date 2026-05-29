using GymRat.Data;
using GymRat.Models;

namespace GymRat.Tests.Helpers;

public class SeedBuilder
{
    private readonly AppDbContext db;

    public SeedBuilder(AppDbContext db)
    {
        this.db = db;
    }

    // ----------------------------------------------------
    // GYM
    // ----------------------------------------------------

    public SeedBuilder WithGym(out Gym gym, int id = 1, string slug = "test-gym")
    {
        gym = new Gym
        {
            Id = id,
            Name = "Test Gym",
            Email = "gym@test.com",
            Phone = "9999999999",
            Address = "Test Address",
            Slug = slug
        };

        db.Gyms.Add(gym);

        return this;
    }

    // ----------------------------------------------------
    // USER + MEMBER
    // ----------------------------------------------------

    public SeedBuilder WithMember(
        out Member member,
        int gymId = 1,
        string status = "Inactive",
        string email = "member@test.com",
        string fullName = "Test Member")
    {
        var user = new User
        {
            Name = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
            Role = "Member",
            GymId = gymId
        };

        db.Users.Add(user);

        member = new Member
        {
            FullName = fullName,
            Email = email,
            Phone = "9999999999",
            Address = "Test Address",
            JoinDate = DateTime.UtcNow,
            Status = status,
            GymId = gymId,
            User = user
        };

        db.Members.Add(member);

        return this;
    }

    // ----------------------------------------------------
    // MEMBERSHIP PLAN
    // ----------------------------------------------------

    public SeedBuilder WithPlan(
        out MembershipPlan plan,
        int gymId = 1,
        string name = "Monthly",
        decimal price = 1000)
    {
        plan = new MembershipPlan
        {
            GymId = gymId,
            Name = name,
            Price = price
        };

        db.MembershipPlans.Add(plan);

        return this;
    }

    // ----------------------------------------------------
    // SUBSCRIPTION
    // ----------------------------------------------------

    public SeedBuilder WithSubscription(
        out MemberSubscription sub,
        Member member,
        MembershipPlan plan,
        string status = "Pending",
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow;

        sub = new MemberSubscription
        {
            Member = member,
            MembershipPlan = plan,
            GymId = member.GymId,
            StartDate = start,
            EndDate = endDate ?? start.AddDays(30),
            Status = status
        };

        db.MemberSubscriptions.Add(sub);

        return this;
    }

    // ----------------------------------------------------
    // PAYMENT
    // ----------------------------------------------------

    public SeedBuilder WithPayment(
        out Payment payment,
        MemberSubscription sub,
        string status = "Paid",
        decimal? amount = null)
    {
        payment = new Payment
        {
            MemberSubscription = sub,
            GymId = sub.GymId,
            Amount = amount ?? sub.MembershipPlan.Price,
            Status = status,
            PaidAt = status == "Paid"
                ? DateTime.UtcNow
                : null
        };

        db.Payments.Add(payment);

        return this;
    }

    // ----------------------------------------------------
    // ATTENDANCE
    // ----------------------------------------------------

    public SeedBuilder WithAttendance(
        out Attendance attendance,
        Member member,
        DateTime? checkIn = null,
        DateTime? checkOut = null)
    {
        var checkInTime = checkIn ?? DateTime.UtcNow;

        attendance = new Attendance
        {
            Member = member,
            GymId = member.GymId,
            CheckInTime = checkInTime,
            CheckOutTime = checkOut,
            Date = DateOnly.FromDateTime(checkInTime)
        };

        db.Attendances.Add(attendance);

        return this;
    }

    // ----------------------------------------------------
    // REFRESH TOKEN
    // ----------------------------------------------------

    public SeedBuilder WithRefreshToken(
        out RefreshToken token,
        User user,
        bool isRevoked = false,
        DateTime? expiry = null)
    {
        token = new RefreshToken
        {
            User = user,
            Token = Guid.NewGuid().ToString(),
            ExpiresAt = expiry ?? DateTime.UtcNow.AddDays(7),
            IsRevoked = isRevoked
        };

        db.RefreshTokens.Add(token);

        return this;
    }

    // ----------------------------------------------------
    // SAVE
    // ----------------------------------------------------

    public async Task SaveAsync()
    {
        await db.SaveChangesAsync();
    }

    public SeedBuilder Save()
    {
        db.SaveChanges();
        return this;
    }
}