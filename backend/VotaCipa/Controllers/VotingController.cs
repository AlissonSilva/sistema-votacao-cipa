using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotaCipa.Data;
using VotaCipa.DTOs;
using VotaCipa.Enums;
using VotaCipa.Models;

namespace VotaCipa.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VotingController : ControllerBase
{
    private readonly AppDbContext _context;

    public VotingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<VoteResponse>> CastVote([FromBody] CastVoteRequest request)
    {
        var period = await _context.ElectoralPeriods.FindAsync(request.ElectoralPeriodId);
        if (period == null)
            return BadRequest(new { message = "Período eleitoral não encontrado" });

        if (period.Status != ElectoralPeriodStatus.Open)
            return BadRequest(new { message = "Votação não está aberta para este período" });

        if (DateTime.UtcNow < period.StartDate || DateTime.UtcNow > period.EndDate)
            return BadRequest(new { message = "Fora do período de votação" });

        var candidate = await _context.Candidates
            .FirstOrDefaultAsync(c => c.Id == request.CandidateId && c.ElectoralPeriodId == request.ElectoralPeriodId);
        if (candidate == null)
            return BadRequest(new { message = "Candidato não encontrado neste período eleitoral" });

        var alreadyVoted = await _context.Votes
            .AnyAsync(v => v.ElectoralPeriodId == request.ElectoralPeriodId && v.VoterRegistration == request.VoterRegistration);
        if (alreadyVoted)
            return Conflict(new { message = "Matrícula já votou neste período eleitoral" });

        var vote = new Vote
        {
            ElectoralPeriodId = request.ElectoralPeriodId,
            CandidateId = request.CandidateId,
            VoterRegistration = request.VoterRegistration
        };

        _context.Votes.Add(vote);
        await _context.SaveChangesAsync();

        return Ok(new VoteResponse(vote.Id, vote.ElectoralPeriodId, vote.CandidateId, vote.VoterRegistration, vote.VotedAt));
    }

    [HttpGet("check/{periodId}/{registration}")]
    public async Task<ActionResult<object>> CheckVote(int periodId, string registration)
    {
        var hasVoted = await _context.Votes
            .AnyAsync(v => v.ElectoralPeriodId == periodId && v.VoterRegistration == registration);
        return Ok(new { hasVoted });
    }
}
