using VotaCipa.Enums;

namespace VotaCipa.DTOs;

public record CreateElectoralPeriodRequest(string Name, string Description, DateTime StartDate, DateTime EndDate);
public record UpdateElectoralPeriodRequest(string? Name, string? Description, DateTime? StartDate, DateTime? EndDate, ElectoralPeriodStatus? Status);
public record ElectoralPeriodResponse(int Id, string Name, string Description, DateTime StartDate, DateTime EndDate, string Status, int CandidateCount, int VoteCount, DateTime CreatedAt);
