using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotaCipa.Data;
using VotaCipa.DTOs;
using VotaCipa.Enums;

namespace VotaCipa.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CountingController : ControllerBase
{
    private readonly AppDbContext _context;

    public CountingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("partial/{periodId}")]
    public async Task<ActionResult<CountingResponse>> PartialCounting(int periodId)
    {
        var period = await _context.ElectoralPeriods.FindAsync(periodId);
        if (period == null) return NotFound();

        if (period.Status == ElectoralPeriodStatus.Created)
            return BadRequest(new { message = "Período eleitoral ainda não foi aberto para votação" });

        return Ok(await GetCountingResults(period));
    }

    [HttpGet("final/{periodId}")]
    public async Task<ActionResult<CountingResponse>> FinalCounting(int periodId)
    {
        var period = await _context.ElectoralPeriods
            .FirstOrDefaultAsync(ep => ep.Id == periodId);

        if (period == null) return NotFound();

        if (period.Status != ElectoralPeriodStatus.Closed && period.Status != ElectoralPeriodStatus.Finalized)
            return BadRequest(new { message = "A apuração final só pode ser realizada após o encerramento da votação" });

        if (period.Status == ElectoralPeriodStatus.Closed)
        {
            period.Status = ElectoralPeriodStatus.Finalized;
            await _context.SaveChangesAsync();
        }

        return Ok(await GetCountingResults(period));
    }

    private async Task<CountingResponse> GetCountingResults(Models.ElectoralPeriod period)
    {
        var totalVotes = await _context.Votes.CountAsync(v => v.ElectoralPeriodId == period.Id);

        var results = await _context.Candidates
            .Where(c => c.ElectoralPeriodId == period.Id)
            .Select(c => new CandidateVoteCount(
                c.Id,
                c.Name,
                c.Registration,
                c.Department,
                c.Votes.Count,
                totalVotes > 0 ? Math.Round((double)c.Votes.Count / totalVotes * 100, 2) : 0
            ))
            .OrderByDescending(c => c.VoteCount)
            .ToListAsync();

        return new CountingResponse(
            period.Id,
            period.Name,
            period.Status.ToString(),
            totalVotes,
            results.Count,
            results
        );
    }
}
