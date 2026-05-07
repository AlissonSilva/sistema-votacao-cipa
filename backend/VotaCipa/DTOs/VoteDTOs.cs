namespace VotaCipa.DTOs;

public record CastVoteRequest(int ElectoralPeriodId, int CandidateId, string VoterRegistration);
public record VoteResponse(int Id, int ElectoralPeriodId, int CandidateId, string VoterRegistration, DateTime VotedAt);
