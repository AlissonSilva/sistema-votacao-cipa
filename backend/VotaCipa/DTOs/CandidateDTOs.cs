namespace VotaCipa.DTOs;

public record CreateCandidateRequest(int ElectoralPeriodId, string Registration, string Name, string Email, string Department, string? PhotoUrl);
public record UpdateCandidateRequest(string? Name, string? Email, string? Department, string? PhotoUrl);
public record CandidateResponse(int Id, int ElectoralPeriodId, string Registration, string Name, string Email, string Department, string PhotoUrl, DateTime CreatedAt);
