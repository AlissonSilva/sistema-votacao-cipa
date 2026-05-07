using VotaCipa.Enums;

namespace VotaCipa.DTOs;

public record LoginRequest(string Registration, string Password);
public record LoginResponse(string Token, string Name, string Role);
public record CreateUserRequest(string Registration, string Name, string Email, string Password, UserRole Role);
public record UpdateUserRequest(string? Name, string? Email, string? Password, UserRole? Role, bool? Active);
public record UserResponse(int Id, string Registration, string Name, string Email, string Role, bool Active, DateTime CreatedAt);
