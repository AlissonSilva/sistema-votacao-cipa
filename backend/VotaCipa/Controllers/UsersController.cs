using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotaCipa.Data;
using VotaCipa.DTOs;
using VotaCipa.Models;

namespace VotaCipa.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var users = await _context.Users
            .Select(u => new UserResponse(u.Id, u.Registration, u.Name, u.Email, u.Role.ToString(), u.Active, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(new UserResponse(user.Id, user.Registration, user.Name, user.Email, user.Role.ToString(), user.Active, user.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Registration == request.Registration))
            return Conflict(new { message = "Matrícula já cadastrada" });

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict(new { message = "Email já cadastrado" });

        var user = new User
        {
            Registration = request.Registration,
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id },
            new UserResponse(user.Id, user.Registration, user.Name, user.Email, user.Role.ToString(), user.Active, user.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (request.Name != null) user.Name = request.Name;
        if (request.Email != null) user.Email = request.Email;
        if (request.Password != null) user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        if (request.Role != null) user.Role = request.Role.Value;
        if (request.Active != null) user.Active = request.Active.Value;

        await _context.SaveChangesAsync();
        return Ok(new UserResponse(user.Id, user.Registration, user.Name, user.Email, user.Role.ToString(), user.Active, user.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Active = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
