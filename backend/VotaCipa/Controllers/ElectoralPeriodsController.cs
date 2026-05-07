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
[Authorize(Roles = "Admin")]
public class ElectoralPeriodsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ElectoralPeriodsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ElectoralPeriodResponse>>> GetAll()
    {
        var periods = await _context.ElectoralPeriods
            .Include(ep => ep.Candidates)
            .Include(ep => ep.Votes)
            .Select(ep => new ElectoralPeriodResponse(
                ep.Id, ep.Name, ep.Description, ep.StartDate, ep.EndDate,
                ep.Status.ToString(), ep.Candidates.Count, ep.Votes.Count, ep.CreatedAt))
            .ToListAsync();
        return Ok(periods);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ElectoralPeriodResponse>> GetById(int id)
    {
        var ep = await _context.ElectoralPeriods
            .Include(e => e.Candidates)
            .Include(e => e.Votes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (ep == null) return NotFound();

        return Ok(new ElectoralPeriodResponse(
            ep.Id, ep.Name, ep.Description, ep.StartDate, ep.EndDate,
            ep.Status.ToString(), ep.Candidates.Count, ep.Votes.Count, ep.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<ElectoralPeriodResponse>> Create([FromBody] CreateElectoralPeriodRequest request)
    {
        var period = new ElectoralPeriod
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        _context.ElectoralPeriods.Add(period);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = period.Id },
            new ElectoralPeriodResponse(period.Id, period.Name, period.Description,
                period.StartDate, period.EndDate, period.Status.ToString(), 0, 0, period.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ElectoralPeriodResponse>> Update(int id, [FromBody] UpdateElectoralPeriodRequest request)
    {
        var period = await _context.ElectoralPeriods
            .Include(e => e.Candidates)
            .Include(e => e.Votes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (period == null) return NotFound();

        if (request.Name != null) period.Name = request.Name;
        if (request.Description != null) period.Description = request.Description;
        if (request.StartDate != null) period.StartDate = request.StartDate.Value;
        if (request.EndDate != null) period.EndDate = request.EndDate.Value;
        if (request.Status != null) period.Status = request.Status.Value;

        await _context.SaveChangesAsync();

        return Ok(new ElectoralPeriodResponse(period.Id, period.Name, period.Description,
            period.StartDate, period.EndDate, period.Status.ToString(),
            period.Candidates.Count, period.Votes.Count, period.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var period = await _context.ElectoralPeriods.FindAsync(id);
        if (period == null) return NotFound();

        if (period.Status != ElectoralPeriodStatus.Created)
            return BadRequest(new { message = "Só é possível excluir períodos com status 'Criado'" });

        _context.ElectoralPeriods.Remove(period);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
