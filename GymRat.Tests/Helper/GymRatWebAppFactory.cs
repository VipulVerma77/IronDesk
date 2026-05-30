using GymRat.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GymRat.Tests.Helpers;

public class GymRatWebAppFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment
        builder.UseEnvironment("Testing");

        // Override configuration BEFORE services are built
        builder.UseSetting("Jwt:Key", "THIS_IS_A_FAKE_SECRET_KEY_FOR_TESTING_ONLY_32CHARS");
        builder.UseSetting("Jwt:Issuer", "GymRatAPI");
        builder.UseSetting("Jwt:Audience", "GymRatUsers");
        builder.UseSetting("ConnectionStrings:DefaultConnection", "DataSource=:memory:");

        builder.ConfigureServices(services =>
        {
            // Remove real MySQL DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            // Replace with InMemory database
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}