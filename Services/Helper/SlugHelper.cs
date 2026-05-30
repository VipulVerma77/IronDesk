using System.Text.RegularExpressions;

namespace GymRat.Services.Helper
{
    public static class SlugHelper
    {
        public static string GenerateSlug(string name)
        {
            // "FitZone Gym!" → "fitzone-gym"
            var slug = name.ToLower().Trim();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");   // remove special chars
            slug = Regex.Replace(slug, @"\s+", "-");             // spaces → hyphens
            slug = Regex.Replace(slug, @"-+", "-");              // collapse multiple hyphens
            return slug.Trim('-');
        }
    }
}