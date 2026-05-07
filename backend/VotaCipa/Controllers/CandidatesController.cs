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
public class CandidatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CandidatesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("period/{periodId}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CandidateResponse>>> GetByPeriod(int periodId)
    {
        var candidates = await _context.Candidates
            .Where(c => c.ElectoralPeriodId == periodId)
            .Select(c => new CandidateResponse(c.Id, c.ElectoralPeriodId, c.Registration,
                c.Name, c.Email, c.Department, c.PhotoUrl, c.CreatedAt))
            .ToListAsync();
        return Ok(candidates);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CandidateResponse>> GetById(int id)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return NotFound();

        return Ok(new CandidateResponse(candidate.Id, candidate.ElectoralPeriodId,
            candidate.Registration, candidate.Name, candidate.Email,
            candidate.Department, candidate.PhotoUrl, candidate.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<CandidateResponse>> Create([FromBody] CreateCandidateRequest request)
    {
        var period = await _context.ElectoralPeriods.FindAsync(request.ElectoralPeriodId);
        if (period == null)
            return BadRequest(new { message = "Período eleitoral não encontrado" });

        if (period.Status == ElectoralPeriodStatus.Closed || period.Status == ElectoralPeriodStatus.Finalized)
            return BadRequest(new { message = "Não é possível adicionar candidatos em período fechado ou finalizado" });

        if (await _context.Candidates.AnyAsync(c => c.ElectoralPeriodId == request.ElectoralPeriodId && c.Registration == request.Registration))
            return Conflict(new { message = "Candidato já cadastrado neste período eleitoral" });

        var candidate = new Candidate
        {
            ElectoralPeriodId = request.ElectoralPeriodId,
            Registration = request.Registration,
            Name = request.Name,
            Email = request.Email,
            Department = request.Department,
            PhotoUrl = request.PhotoUrl ?? string.Empty
        };

        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = candidate.Id },
            new CandidateResponse(candidate.Id, candidate.ElectoralPeriodId,
                candidate.Registration, candidate.Name, candidate.Email,
                candidate.Department, candidate.PhotoUrl, candidate.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CandidateResponse>> Update(int id, [FromBody] UpdateCandidateRequest request)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return NotFound();

        if (request.Name != null) candidate.Name = request.Name;
        if (request.Email != null) candidate.Email = request.Email;
        if (request.Department != null) candidate.Department = request.Department;
        if (request.PhotoUrl != null) candidate.PhotoUrl = request.PhotoUrl;

        await _context.SaveChangesAsync();

        return Ok(new CandidateResponse(candidate.Id, candidate.ElectoralPeriodId,
            candidate.Registration, candidate.Name, candidate.Email,
            candidate.Department, candidate.PhotoUrl, candidate.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var candidate = await _context.Candidates
            .Include(c => c.ElectoralPeriod)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (candidate == null) return NotFound();

        if (candidate.ElectoralPeriod.Status == ElectoralPeriodStatus.Open)
            return BadRequest(new { message = "Não é possível remover candidatos durante votação aberta" });

        _context.Candidates.Remove(candidate);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
