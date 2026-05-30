using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GymRat.DTOs.Gym;
using GymRat.Tests.Helpers;
using Xunit;

namespace GymRat.Tests.Integration;

public class GymControllerTests : IntegrationTestBase
{
    // ─────────────────────────────────────────
    // POST /api/gym/register
    // ─────────────────────────────────────────

    [Fact]
    public async Task RegisterGym_WithValidData_Returns200()
    {
        var response = await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName     = "FitZone",
            GymEmail    = "fitzone@gym.com",
            Phone       = "9999999999",
            Address     = "123 Main St",
            AdminName   = "Admin User",
            AdminEmail  = "admin@fitzone.com",
            Password    = "Admin123!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.Name.Should().Be("FitZone");
    }

    [Fact]
    public async Task RegisterGym_WithValidData_GeneratesSlug()
    {
        var response = await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName     = "Iron Desk Gym",
            GymEmail    = "irondesk@gym.com",
            Phone       = "9999999999",
            Address     = "123 Main St",
            AdminName   = "Admin",
            AdminEmail  = "admin@irondesk.com",
            Password    = "Admin123!",
        });

        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.Data!.Slug.Should().Be("iron-desk-gym");
    }

    [Fact]
    public async Task RegisterGym_WithDuplicateGymEmail_Returns200WithFailResponse()
    {
        // Register first gym
        await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName    = "Gym One",
            GymEmail   = "duplicate@gym.com",
            Phone      = "9999999999",
            Address    = "Test Address",
            AdminName  = "Admin One",
            AdminEmail = "adminone@gym.com",
            Password   = "Admin123!",
        });

        // Try to register with same gym email
        var response = await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName    = "Gym Two",
            GymEmail   = "duplicate@gym.com",
            Phone      = "9999999999",
            Address    = "Test Address",
            AdminName  = "Admin Two",
            AdminEmail = "admintwo@gym.com",
            Password   = "Admin123!",
        });

        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Gym email already exists");
    }

    // ─────────────────────────────────────────
    // GET /api/gym/public/{slug}
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetBySlug_WithValidSlug_Returns200()
    {
        // Register gym first
        await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName    = "Slug Test Gym",
            GymEmail   = "slug@gym.com",
            Phone      = "9999999999",
            Address    = "Test Address",
            AdminName  = "Admin",
            AdminEmail = "admin@slug.com",
            Password   = "Admin123!",
        });

        var response = await Client.GetAsync("/api/gym/public/slug-test-gym");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<PublicGymResponseDto>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.Slug.Should().Be("slug-test-gym");
    }

    [Fact]
    public async Task GetBySlug_WithInvalidSlug_Returns200WithFailResponse()
    {
        var response = await Client.GetAsync("/api/gym/public/does-not-exist");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<PublicGymResponseDto>>();
        result!.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task GetBySlug_NoAuthRequired_Returns200()
    {
        // Register gym
        await Client.PostAsJsonAsync("/api/gym/register", new
        {
            GymName    = "Public Gym",
            GymEmail   = "public@gym.com",
            Phone      = "9999999999",
            Address    = "Test Address",
            AdminName  = "Admin",
            AdminEmail = "admin@public.com",
            Password   = "Admin123!",
        });

        // Clear token — public endpoint needs no auth
        ClearAuthToken();

        var response = await Client.GetAsync("/api/gym/public/public-gym");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ─────────────────────────────────────────
    // GET /api/gym/me
    // ─────────────────────────────────────────

    [Fact]
    public async Task GetMyGym_AsAdmin_Returns200WithGymData()
    {
        await RegisterGymAndLoginAsync(
            gymName:    "My Gym",
            gymEmail:   "mygym@gym.com",
            adminEmail: "admin@mygym.com");

        var response = await Client.GetAsync("/api/gym/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.Name.Should().Be("My Gym");
    }

    [Fact]
    public async Task GetMyGym_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.GetAsync("/api/gym/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // PUT /api/gym/update
    // ─────────────────────────────────────────

    [Fact]
    public async Task UpdateGym_AsAdmin_Returns200WithUpdatedData()
    {
        await RegisterGymAndLoginAsync(
            gymName:    "Old Name",
            gymEmail:   "oldname@gym.com",
            adminEmail: "admin@oldname.com");

        var response = await Client.PutAsJsonAsync("/api/gym/update", new
        {
            Name = "New Name",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.Name.Should().Be("New Name");
    }

    [Fact]
    public async Task UpdateGym_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.PutAsJsonAsync("/api/gym/update", new
        {
            Name = "New Name",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // PUT /api/gym/update-theme
    // ─────────────────────────────────────────

    [Fact]
    public async Task UpdateTheme_WithValidTheme_Returns200()
    {
        await RegisterGymAndLoginAsync(
            gymEmail:   "theme@gym.com",
            adminEmail: "admin@theme.com");

        var response = await Client.PutAsJsonAsync("/api/gym/update-theme", new
        {
            Theme = "dark",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeTrue();
        result.Data!.Theme.Should().Be("dark");
    }

    [Fact]
    public async Task UpdateTheme_WithInvalidTheme_Returns200WithFailResponse()
    {
        await RegisterGymAndLoginAsync(
            gymEmail:   "badtheme@gym.com",
            adminEmail: "admin@badtheme.com");

        var response = await Client.PutAsJsonAsync("/api/gym/update-theme", new
        {
            Theme = "purple",
        });

        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<GymResponseDto>>();
        result!.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid theme");
    }

    [Fact]
    public async Task UpdateTheme_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.PutAsJsonAsync("/api/gym/update-theme", new
        {
            Theme = "dark",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─────────────────────────────────────────
    // DELETE /api/gym/delete
    // ─────────────────────────────────────────

    [Fact]
    public async Task DeleteGym_AsAdmin_Returns200()
    {
        await RegisterGymAndLoginAsync(
            gymEmail:   "delete@gym.com",
            adminEmail: "admin@delete.com");

        var response = await Client.DeleteAsync("/api/gym/delete");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content
            .ReadFromJsonAsync<ApiResponseWrapper<object>>();
        result!.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("deleted");
    }

    [Fact]
    public async Task DeleteGym_WithoutToken_Returns401()
    {
        ClearAuthToken();

        var response = await Client.DeleteAsync("/api/gym/delete");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}