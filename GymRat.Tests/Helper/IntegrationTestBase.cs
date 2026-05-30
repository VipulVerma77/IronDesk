using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymRat.Data;
using GymRat.DTOs.Gym;
using GymRat.Models;
using Microsoft.Extensions.DependencyInjection;

namespace GymRat.Tests.Helpers;

/// <summary>
/// Base class for all integration tests.
/// Provides HttpClient, database access, and JWT token helpers.
/// </summary>
public abstract class IntegrationTestBase : IDisposable
{
    protected readonly GymRatWebAppFactory Factory;
    protected readonly HttpClient Client;

    protected IntegrationTestBase()
    {
        Factory = new GymRatWebAppFactory();
        Client  = Factory.CreateClient();
    }

    // ─────────────────────────────────────────
    // Database access
    // ─────────────────────────────────────────

    /// <summary>
    /// Gets a scoped DbContext for seeding data directly in tests.
    /// Always dispose after use.
    /// </summary>
    protected AppDbContext GetDb()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }

    // ─────────────────────────────────────────
    // Auth helpers
    // ─────────────────────────────────────────

    /// <summary>
    /// Registers a gym + admin, logs in, sets the JWT on the HttpClient,
    /// and returns the access token for further assertions.
    /// </summary>
    protected async Task<string> RegisterGymAndLoginAsync(
        string gymName    = "Test Gym",
        string gymEmail   = "gym@test.com",
        string adminEmail = "admin@test.com",
        string password   = "Admin123!")
    {
        // 1. Register gym
        var registerDto = new GymRegistrationDto
        {
            GymName     = gymName,
            GymEmail    = gymEmail,
            Phone       = "9999999999",
            Address     = "Test Address",
            AdminName   = "Test Admin",
            AdminEmail  = adminEmail,
            Password    = password,
        };

        await Client.PostAsJsonAsync("/api/gym/register", registerDto);

        // 2. Login
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            Email    = adminEmail,
            Password = password,
        });

        var loginResult = await loginResponse.Content
            .ReadFromJsonAsync<LoginResponseWrapper>();

        var token = loginResult?.Data?.AccessToken ?? string.Empty;

        // 3. Set token on client
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        return token;
    }

    /// <summary>
    /// Sets a JWT token on the HttpClient for authenticated requests.
    /// </summary>
    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    /// <summary>
    /// Removes auth token — simulates unauthenticated request.
    /// </summary>
    protected void ClearAuthToken()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    public void Dispose()
    {
        Client.Dispose();
        Factory.Dispose();
    }
}

// ─────────────────────────────────────────
// Response wrappers for deserialization
// ─────────────────────────────────────────

public class LoginResponseWrapper
{
    public string Status  { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public LoginDataWrapper? Data { get; set; }
}

public class LoginDataWrapper
{
    public string AccessToken  { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Email        { get; set; } = string.Empty;
    public string Name         { get; set; } = string.Empty;
    public string Role         { get; set; } = string.Empty;
}

public class ApiResponseWrapper<T>
{
    public string Status  { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public T? Data        { get; set; }
    public bool IsSuccess => Status == "success";
}