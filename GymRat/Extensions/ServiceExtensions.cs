using GymRat.Models;
using GymRat.Services;
using GymRat.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GymRat.DTOs;
using System.Text.Json;

public static class ServiceExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration config)
    {
        var jwt = config.GetSection("Jwt");
        services.Configure<JwtSettings>(jwt);

        var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
   {
       options.TokenValidationParameters = new TokenValidationParameters
       {
           ValidateIssuer = true,
           ValidateAudience = true,
           ValidateLifetime = true,
           ValidateIssuerSigningKey = true,

           ValidIssuer = jwt["Issuer"],
           ValidAudience = jwt["Audience"],
           IssuerSigningKey = new SymmetricSecurityKey(key)
       };

       options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
       {
           OnChallenge = async context =>
           {
               context.HandleResponse(); // stop default response

               context.Response.StatusCode = 401;
               context.Response.ContentType = "application/json";

               var response = ApiResponse<object>.Fail("Unauthorized - Invalid or missing token");

               await context.Response.WriteAsync(JsonSerializer.Serialize(response));
           },

           OnForbidden = async context =>
           {
               context.Response.StatusCode = 403;
               context.Response.ContentType = "application/json";

               var response = ApiResponse<object>.Fail("Forbidden - You don't have permission");

               await context.Response.WriteAsync(JsonSerializer.Serialize(response));
           }
       };
   });

        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}