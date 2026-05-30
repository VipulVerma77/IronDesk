using FluentAssertions;
using GymRat.Models;
using GymRat.Services;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Unit;

public class PaymentServiceTests : TestBase
{
    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    private static PaymentService BuildSut(GymRat.Data.AppDbContext db) =>
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
        int gymId = 1, string status = "Inactive")
    {
        var user = new User
        {
            Name         = "Test Member",
            Email        = "member@test.com",
            PasswordHash = "hashed",
            Role         = "Member",
            GymId        = gymId,
        };
        db.Users.Add(user);
        db.SaveChanges();

        var member = new Member
        {
            FullName = "Test Member",
            Email    = "member@test.com",
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

    private static MembershipPlan SeedPlan(GymRat.Data.AppDbContext db,
        int gymId = 1, int durationDays = 30)
    {
        var plan = new MembershipPlan
        {
            GymId          = gymId,
            Name           = "Monthly",
            Price          = 1000,
            DurationInDays = durationDays,
        };
        db.MembershipPlans.Add(plan);
        db.SaveChanges();
        return plan;
    }

    private static (MemberSubscription sub, Payment payment) SeedSubWithPayment(
        GymRat.Data.AppDbContext db,
        Member member,
        MembershipPlan plan,
        string subStatus     = "Pending",
        string paymentStatus = "Pending",
        DateTime? startDate  = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date;

        var sub = new MemberSubscription
        {
            MemberId         = member.Id,
            Member           = member,
            MembershipPlanId = plan.Id,
            GymId            = member.GymId,
            StartDate        = start,
            EndDate          = start.AddDays(plan.DurationInDays),
            Status           = subStatus,
        };
        db.MemberSubscriptions.Add(sub);
        db.SaveChanges();

        var payment = new Payment
        {
            MemberSubscriptionId = sub.Id,
            MemberSubscription   = sub,
            GymId                = member.GymId,
            Amount               = plan.Price,
            Status               = paymentStatus,
            PaymentMethod        = "FakeGateway",
        };
        db.Payments.Add(payment);
        db.SaveChanges();

        return (sub, payment);
    }

    // ─────────────────────────────────────────
    // MarkPaymentPaidAsync — happy path
    // ─────────────────────────────────────────

    [Fact]
    public async Task MarkPaid_WithTodayStartDate_ReturnsSuccess()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id, status: "Inactive");
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date);
        var sut = BuildSut(db);

        var result = await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("completed");
    }

    [Fact]
    public async Task MarkPaid_WithTodayStartDate_SetsPaymentStatusToPaid()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date);
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        payment.Status.Should().Be("Paid");
        payment.PaidAt.Should().NotBeNull();
        payment.TransactionId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task MarkPaid_WithTodayStartDate_ActivatesSubscription()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (sub, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date);
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        sub.Status.Should().Be("Active");
    }

    [Fact]
    public async Task MarkPaid_WithTodayStartDate_ActivatesMember()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id, status: "Inactive");
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date);
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        member.Status.Should().Be("Active");
    }

    [Fact]
    public async Task MarkPaid_WithFutureStartDate_SetsSubscriptionToScheduled()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (sub, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date.AddDays(5));
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        sub.Status.Should().Be("Scheduled");
    }

    [Fact]
    public async Task MarkPaid_WithFutureStartDate_DoesNotActivateMember()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id, status: "Inactive");
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date.AddDays(5));
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        member.Status.Should().Be("Inactive");
    }

    [Fact]
    public async Task MarkPaid_WithPastStartDate_ActivatesSubscription()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (sub, payment) = SeedSubWithPayment(db, member, plan,
            startDate: DateTime.UtcNow.Date.AddDays(-3));
        var sut = BuildSut(db);

        await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        sub.Status.Should().Be("Active");
    }

    // ─────────────────────────────────────────
    // MarkPaymentPaidAsync — guard rails
    // ─────────────────────────────────────────

    [Fact]
    public async Task MarkPaid_WhenAlreadyPaid_ReturnsFail()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            subStatus: "Active", paymentStatus: "Paid");
        var sut = BuildSut(db);

        var result = await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("already completed");
    }

    [Fact]
    public async Task MarkPaid_WhenCancelled_ReturnsFail()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            subStatus: "Cancelled", paymentStatus: "Cancelled");
        var sut = BuildSut(db);

        var result = await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("cancelled payment");
    }

    [Fact]
    public async Task MarkPaid_WhenSubscriptionNotPending_ReturnsFail()
    {
        using var db  = CreateDb();
        var gym       = SeedGym(db);
        var plan      = SeedPlan(db, gymId: gym.Id);
        var member    = SeedMember(db, gymId: gym.Id);
        var (_, payment) = SeedSubWithPayment(db, member, plan,
            subStatus: "Active", paymentStatus: "Pending");
        var sut = BuildSut(db);

        var result = await sut.MarkPaymentPaidAsync(payment.Id, gym.Id);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Active");
    }

    [Fact]
    public async Task MarkPaid_WithInvalidPaymentId_ReturnsFail()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.MarkPaymentPaidAsync(9999, gym.Id);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task MarkPaid_FromDifferentGym_ReturnsFail()
    {
        using var db  = CreateDb();
        var gymA      = SeedGym(db, id: 1);
        var gymB      = SeedGym(db, id: 2);
        var plan      = SeedPlan(db, gymId: gymA.Id);
        var member    = SeedMember(db, gymId: gymA.Id);
        var (_, payment) = SeedSubWithPayment(db, member, plan);
        var sut = BuildSut(db);

        // gymB admin tries to mark gymA payment
        var result = await sut.MarkPaymentPaidAsync(payment.Id, gymB.Id);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    // ─────────────────────────────────────────
    // GetAllPaymentsAsync
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetAllPayments_ReturnsOnlyGymPayments()
    {
        using var db  = CreateDb();
        var gymA      = SeedGym(db, id: 1);
        var gymB      = SeedGym(db, id: 2);
        var planA     = SeedPlan(db, gymId: gymA.Id);
        var planB     = SeedPlan(db, gymId: gymB.Id);
        var memberA   = SeedMember(db, gymId: gymA.Id);
        var memberB   = SeedMember(db, gymId: gymB.Id);
        SeedSubWithPayment(db, memberA, planA);
        SeedSubWithPayment(db, memberA, planA);
        SeedSubWithPayment(db, memberB, planB); // different gym
        var sut = BuildSut(db);

        var result = await sut.GetAllPaymentsAsync(gymA.Id, 1, 10);

        result.IsSuccess.Should().BeTrue();
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllPayments_PaginationWorks()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var plan     = SeedPlan(db, gymId: gym.Id);
        var member   = SeedMember(db, gymId: gym.Id);

        for (int i = 0; i < 5; i++)
            SeedSubWithPayment(db, member, plan);

        var sut = BuildSut(db);

        var result = await sut.GetAllPaymentsAsync(gym.Id, pageNumber: 1, pageSize: 2);

        result.Data.Data.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(5);
        result.Data.TotalPages.Should().Be(3);
    }

    [Fact]
    public async Task GetAllPayments_PageSizeExceeds50_ClampsTo50()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.GetAllPaymentsAsync(gym.Id, 1, 100);

        result.IsSuccess.Should().BeTrue();
        result.Data.PageSize.Should().Be(50);
    }

    [Fact]
    public async Task GetAllPayments_WithNoPayments_ReturnsEmptyList()
    {
        using var db = CreateDb();
        var gym      = SeedGym(db);
        var sut      = BuildSut(db);

        var result = await sut.GetAllPaymentsAsync(gym.Id, 1, 10);

        result.IsSuccess.Should().BeTrue();
        result.Data.TotalCount.Should().Be(0);
        result.Data.Data.Should().BeEmpty();
    }
}