using GymRat.Models;
using Microsoft.EntityFrameworkCore;

namespace GymRat.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Gym> Gyms { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<MembershipPlan> MembershipPlans { get; set; }
        public DbSet<MemberSubscription> MemberSubscriptions { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Gym>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Gym>().HasIndex(u => u.Slug).IsUnique();
            modelBuilder.Entity<User>().HasOne(u => u.Gym).WithMany(g => g.Users).HasForeignKey(u => u.GymId);
            modelBuilder.Entity<Member>().HasOne(u => u.Gym).WithMany(g => g.Members).HasForeignKey(u => u.GymId);
            modelBuilder.Entity<Member>().HasOne(m => m.User).WithOne().HasForeignKey<Member>(m => m.UserId);
            modelBuilder.Entity<MembershipPlan>().HasOne(mp => mp.Gym).WithMany(g => g.MembershipPlans).HasForeignKey(mp => mp.GymId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<MemberSubscription>().HasOne(s => s.Member).WithMany().HasForeignKey(s => s.MemberId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MemberSubscription>()
                .HasOne(s => s.MembershipPlan)
                .WithMany()
                .HasForeignKey(s => s.MembershipPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MemberSubscription>()
                .HasOne(s => s.Gym)
                .WithMany(g => g.MemberSubscriptions)
                .HasForeignKey(s => s.GymId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.MemberSubscription)
                .WithMany(ms => ms.Payments)
                .HasForeignKey(p => p.MemberSubscriptionId);
                
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Member)
                .WithMany()
                .HasForeignKey(a => a.MemberId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
