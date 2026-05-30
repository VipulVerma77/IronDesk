using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Integration;

public class AuthControllerTests : IntegrationTestBase
{
    // ─────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithTokens()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@login.com");
        ClearAuthToken();

        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@login.com",
            Password = "Admin123!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@wrong.com");
        ClearAuthToken();

        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@wrong.com",
            Password = "WrongPassword!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_Returns401()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "nobody@nowhere.com",
            Password = "Admin123!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithEmptyEmail_Returns200WithFailResponse()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "",
            Password = "Admin123!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        result!.IsSuccess.Should().BeFalse();
    }
    [Fact]
    public async Task Login_SetsRefreshTokenCookie()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@cookie.com");
        ClearAuthToken();

        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@cookie.com",
            Password = "Admin123!",
        });

        response.Headers.TryGetValues("Set-Cookie", out var cookies);
        cookies.Should().NotBeNull();
        cookies!.Should().Contain(c => c.Contains("refreshToken"));
    }

    // ─────────────────────────────────────────
    // POST /api/auth/refresh
    // ─────────────────────────────────────────

    [Fact]
    public async Task Refresh_WithValidToken_Returns200WithNewTokens()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@refresh.com");
        ClearAuthToken();

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@refresh.com",
            Password = "Admin123!",
        });
        var loginResult = await loginResponse.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        var refreshToken = loginResult!.Data!.RefreshToken;

        var response = await Client.PostAsJsonAsync("/api/auth/refresh", new
        {
            RefreshToken = refreshToken,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Refresh_WithInvalidToken_Returns401()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/refresh", new
        {
            RefreshToken = "invalid-token-that-does-not-exist",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Refresh_WithNullToken_Returns401()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/refresh",
            new { RefreshToken = (string?)null });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────

    [Fact]
    public async Task Logout_WithValidToken_Returns200()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@logout.com");
        ClearAuthToken();

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@logout.com",
            Password = "Admin123!",
        });
        var loginResult = await loginResponse.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        var refreshToken = loginResult!.Data!.RefreshToken;

        var response = await Client.PostAsJsonAsync("/api/auth/logout", new
        {
            RefreshToken = refreshToken,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<object>>();
        result!.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Logout_AfterLogout_RefreshTokenIsRevoked()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@revoke.com");
        ClearAuthToken();

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@revoke.com",
            Password = "Admin123!",
        });
        var loginResult = await loginResponse.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        var refreshToken = loginResult!.Data!.RefreshToken;

        await Client.PostAsJsonAsync("/api/auth/logout", new
        {
            RefreshToken = refreshToken,
        });

        var refreshResponse = await Client.PostAsJsonAsync("/api/auth/refresh", new
        {
            RefreshToken = refreshToken,
        });

        refreshResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // GET /api/auth/profile
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetProfile_WithValidToken_Returns200()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@profile.com");

        var response = await Client.GetAsync("/api/auth/profile");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<object>>();
        result!.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task GetProfile_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.GetAsync("/api/auth/profile");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // POST /api/auth/register (Admin only)
    // ─────────────────────────────────────────

    [Fact]
    public async Task Register_AsAdmin_Returns200()
    {
        await RegisterGymAndLoginAsync(adminEmail: "admin@reg.com");

        var response = await Client.PostAsJsonAsync("/api/auth/register", new
        {
            Name = "New Member",
            Email = "newmember@test.com",
            Password = "Member123!",
            Role = "Member",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<LoginDataWrapper>>();
        result!.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Register_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.PostAsJsonAsync("/api/auth/register", new
        {
            Name = "New Member",
            Email = "member@test.com",
            Password = "Member123!",
            Role = "Member",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}