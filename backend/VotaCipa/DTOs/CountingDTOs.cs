namespace VotaCipa.DTOs;

public record CandidateVoteCount(int CandidateId, string CandidateName, string Registration, string Department, int VoteCount, double Percentage);
public record CountingResponse(int ElectoralPeriodId, string ElectoralPeriodName, string Status, int TotalVotes, int TotalCandidates, List<CandidateVoteCount> Results);
