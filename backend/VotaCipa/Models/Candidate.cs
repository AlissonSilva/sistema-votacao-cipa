namespace VotaCipa.Models;

public class Candidate
{
    public int Id { get; set; }
    public int ElectoralPeriodId { get; set; }
    public string Registration { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ElectoralPeriod ElectoralPeriod { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
