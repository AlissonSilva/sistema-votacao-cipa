using Microsoft.EntityFrameworkCore;
using VotaCipa.Models;

namespace VotaCipa.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ElectoralPeriod> ElectoralPeriods => Set<ElectoralPeriod>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Vote> Votes => Set<Vote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Registration).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<ElectoralPeriod>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ElectoralPeriod)
                  .WithMany(ep => ep.Candidates)
                  .HasForeignKey(e => e.ElectoralPeriodId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.ElectoralPeriodId, e.Registration }).IsUnique();
        });

        modelBuilder.Entity<Vote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ElectoralPeriod)
                  .WithMany(ep => ep.Votes)
                  .HasForeignKey(e => e.ElectoralPeriodId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Candidate)
                  .WithMany(c => c.Votes)
                  .HasForeignKey(e => e.CandidateId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => new { e.ElectoralPeriodId, e.VoterRegistration }).IsUnique();
        });
    }
}
