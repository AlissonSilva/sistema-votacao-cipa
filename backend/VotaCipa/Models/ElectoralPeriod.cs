using VotaCipa.Enums;

namespace VotaCipa.Models;

public class ElectoralPeriod
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public ElectoralPeriodStatus Status { get; set; } = ElectoralPeriodStatus.Created;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Candidate> Candidates { get; set; } = new List<Candidate>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
