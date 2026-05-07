using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotaCipa.Data;
using VotaCipa.DTOs;
using VotaCipa.Services;

namespace VotaCipa.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Registration == request.Registration && u.Active);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Matrícula ou senha inválidos" });

        var token = _tokenService.GenerateToken(user);
        return Ok(new LoginResponse(token, user.Name, user.Role.ToString()));
    }
}
