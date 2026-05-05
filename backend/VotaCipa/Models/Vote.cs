namespace VotaCipa.Models;

public class Vote
{
    public int Id { get; set; }
    public int ElectoralPeriodId { get; set; }
    public int CandidateId { get; set; }
    public string VoterRegistration { get; set; } = string.Empty;
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    public ElectoralPeriod ElectoralPeriod { get; set; } = null!;
    public Candidate Candidate { get; set; } = null!;
}
