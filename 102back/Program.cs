using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Database Initialization
InitializeDatabase(connectionString!);

// --- AUTH ROUTES ---
app.MapPost("/api/login", async (LoginRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    
    var command = new SqlCommand("SELECT id, name, username, password, role FROM users WHERE username = @username", connection);
    command.Parameters.AddWithValue("@username", request.username);
    
    using var reader = await command.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var dbPassword = reader.GetString(3);
        if (BCrypt.Net.BCrypt.Verify(request.password, dbPassword))
        {
            var user = new
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Username = reader.GetString(2),
                Role = reader.GetString(4)
            };

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            return Results.Ok(new { token = tokenHandler.WriteToken(token), user });
        }
    }
    
    return Results.Unauthorized();
});

// --- USER MANAGEMENT ---
app.MapGet("/api/users-by-role/{role}", async (string role) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, name, mobile, email, gender, birthdate, date_of_joining, username, role FROM users WHERE role = @role", connection);
    command.Parameters.AddWithValue("@role", role);
    
    var users = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        users.Add(new
        {
            id = reader.GetInt32(0),
            name = reader.IsDBNull(1) ? null : reader.GetString(1),
            mobile = reader.IsDBNull(2) ? null : reader.GetString(2),
            email = reader.GetString(3),
            gender = reader.IsDBNull(4) ? null : reader.GetString(4),
            birthdate = reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
            date_of_joining = reader.IsDBNull(6) ? (DateTime?)null : reader.GetDateTime(6),
            username = reader.GetString(7),
            role = reader.GetString(8)
        });
    }
    return Results.Ok(users);
}).RequireAuthorization(p => p.RequireRole("admin", "superadmin"));

app.MapGet("/api/users", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, name, mobile, email, gender, birthdate, date_of_joining, username, role FROM users", connection);
    
    var users = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        users.Add(new
        {
            id = reader.GetInt32(0),
            name = reader.IsDBNull(1) ? null : reader.GetString(1),
            mobile = reader.IsDBNull(2) ? null : reader.GetString(2),
            email = reader.GetString(3),
            gender = reader.IsDBNull(4) ? null : reader.GetString(4),
            birthdate = reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
            date_of_joining = reader.IsDBNull(6) ? (DateTime?)null : reader.GetDateTime(6),
            username = reader.GetString(7),
            role = reader.GetString(8)
        });
    }
    return Results.Ok(users);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapPost("/api/users", async (UserCreateRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.password);
    var command = new SqlCommand(@"
        INSERT INTO users (name, mobile, email, gender, birthdate, date_of_joining, username, password, role) 
        VALUES (@name, @mobile, @email, @gender, @birthdate, @date_of_joining, @username, @password, @role)", connection);
    
    command.Parameters.AddWithValue("@name", request.name ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@mobile", request.mobile ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@email", request.email);
    command.Parameters.AddWithValue("@gender", request.gender ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@birthdate", request.birthdate ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@date_of_joining", request.date_of_joining ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@username", request.username);
    command.Parameters.AddWithValue("@password", hashedPassword);
    command.Parameters.AddWithValue("@role", request.role);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/users", new { message = "User created" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapPut("/api/users/{id}/reset-password", async (int id, PasswordResetRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.password);
    var command = new SqlCommand("UPDATE users SET password = @password WHERE id = @id", connection);
    command.Parameters.AddWithValue("@password", hashedPassword);
    command.Parameters.AddWithValue("@id", id);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Password reset successful" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapPut("/api/users/{id}", async (int id, UserUpdateRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        UPDATE users 
        SET name = @name, mobile = @mobile, email = @email, gender = @gender, 
            birthdate = @birthdate, date_of_joining = @date_of_joining, username = @username
        WHERE id = @id", connection);
    
    command.Parameters.AddWithValue("@name", request.name ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@mobile", request.mobile ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@email", request.email);
    command.Parameters.AddWithValue("@gender", request.gender ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@birthdate", request.birthdate ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@date_of_joining", request.date_of_joining ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@username", request.username);
    command.Parameters.AddWithValue("@id", id);

    var affected = await command.ExecuteNonQueryAsync();
    if (affected == 0) return Results.NotFound();
    return Results.Ok(new { message = "User updated successfully" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapDelete("/api/users/{id}", async (int id) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("DELETE FROM users WHERE id = @id", connection);
    command.Parameters.AddWithValue("@id", id);
    var affected = await command.ExecuteNonQueryAsync();
    if (affected == 0) return Results.NotFound();
    return Results.Ok(new { message = "User deleted successfully" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

// --- ADMIN ASSIGNMENTS ---
app.MapGet("/api/admins", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, name FROM users WHERE role = 'admin'", connection);
    var admins = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        admins.Add(new { id = reader.GetInt32(0), name = reader.GetString(1) });
    }
    return Results.Ok(admins);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapGet("/api/users-without-admin", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, name FROM users WHERE role = 'user' AND id NOT IN (SELECT user_id FROM admin_user_assignments)", connection);
    var users = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        users.Add(new { id = reader.GetInt32(0), name = reader.GetString(1) });
    }
    return Results.Ok(users);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapPost("/api/assign-role", async (AssignRoleRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    using var transaction = connection.BeginTransaction();
    try
    {
        foreach (var userId in request.user_ids)
        {
            var command = new SqlCommand("INSERT INTO admin_user_assignments (admin_id, user_id) VALUES (@admin_id, @user_id)", connection, transaction);
            command.Parameters.AddWithValue("@admin_id", request.admin_id);
            command.Parameters.AddWithValue("@user_id", userId);
            await command.ExecuteNonQueryAsync();
        }
        await transaction.CommitAsync();
        return Results.Ok(new { message = "Roles assigned" });
    }
    catch
    {
        await transaction.RollbackAsync();
        return Results.Problem("Error assigning roles");
    }
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapGet("/api/assigned-roles", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT a.admin_id, u1.name as admin_name, a.user_id, u2.name as user_name
        FROM admin_user_assignments a
        JOIN users u1 ON a.admin_id = u1.id
        JOIN users u2 ON a.user_id = u2.id", connection);
    var roles = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        roles.Add(new { admin_id = reader.GetInt32(0), admin_name = reader.GetString(1), user_id = reader.GetInt32(2), user_name = reader.GetString(3) });
    }
    return Results.Ok(roles);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapDelete("/api/remove-role/{adminId}/{userId}", async (int adminId, int userId) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("DELETE FROM admin_user_assignments WHERE admin_id = @adminId AND user_id = @userId", connection);
    command.Parameters.AddWithValue("@adminId", adminId);
    command.Parameters.AddWithValue("@userId", userId);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Role removed" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

// --- PROJECTS ---
app.MapGet("/api/projects", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, name, project_code, industry, description, estimated_hours, status FROM projects", connection);
    var projects = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        projects.Add(new
        {
            id = reader.GetInt32(0),
            name = reader.GetString(1),
            projectCode = reader.IsDBNull(2) ? null : reader.GetString(2),
            industry = reader.IsDBNull(3) ? null : reader.GetString(3),
            description = reader.IsDBNull(4) ? null : reader.GetString(4),
            estimatedHours = reader.IsDBNull(5) ? 0 : reader.GetInt32(5),
            status = reader.IsDBNull(6) ? "active" : reader.GetString(6)
        });
    }
    return Results.Ok(projects);
}).RequireAuthorization();

app.MapPost("/api/projects/{id}/validate", async (int id) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("UPDATE projects SET status = 'completed' WHERE id = @id", connection);
    command.Parameters.AddWithValue("@id", id);
    var affected = await command.ExecuteNonQueryAsync();
    if (affected == 0) return Results.NotFound();
    return Results.Ok(new { message = "Project validated and moved to history" });
}).RequireAuthorization(p => p.RequireRole("superadmin", "admin"));

app.MapGet("/api/projects/{id}/details", async (int id) =>
{
    try
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        
        // Project info
        var projectCmd = new SqlCommand("SELECT id, name, project_code, industry, description, estimated_hours, status, created_at FROM projects WHERE id = @id", connection);
        projectCmd.Parameters.AddWithValue("@id", id);
        
        object? project = null;
        using (var reader = await projectCmd.ExecuteReaderAsync())
        {
            if (await reader.ReadAsync())
            {
                project = new
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1),
                    projectCode = reader.IsDBNull(2) ? null : reader.GetString(2),
                    industry = reader.IsDBNull(3) ? null : reader.GetString(3),
                    description = reader.IsDBNull(4) ? null : reader.GetString(4),
                    estimatedHours = reader.IsDBNull(5) ? 0 : reader.GetInt32(5),
                    status = reader.IsDBNull(6) ? "active" : reader.GetString(6),
                    createdAt = reader.IsDBNull(7) ? DateTime.UtcNow : reader.GetDateTime(7)
                };
            }
        }
        
        if (project == null) return Results.NotFound(new { message = $"Project with ID {id} not found" });

        // Contributors (Users who entered timesheets)
        var contributorsCmd = new SqlCommand(@"
            SELECT u.id, u.name, u.email, u.role, CAST(ISNULL(SUM(t.hours), 0) AS DECIMAL(18,2)) as total_hours, COUNT(t.id) as entries
            FROM users u
            JOIN timesheets t ON u.id = t.user_id
            WHERE t.project_id = @id
            GROUP BY u.id, u.name, u.email, u.role", connection);
        contributorsCmd.Parameters.AddWithValue("@id", id);
        
        var contributors = new List<object>();
        using (var reader = await contributorsCmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                contributors.Add(new
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1),
                    email = reader.GetString(2),
                    role = reader.GetString(3),
                    totalHours = reader.GetDecimal(4),
                    entries = reader.GetInt32(5)
                });
            }
        }

        return Results.Ok(new { project, contributors });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in GET /api/projects/{id}/details: {ex.Message}");
        return Results.Problem(ex.Message);
    }
}).RequireAuthorization();

app.MapPost("/api/projects", async (ProjectCreateRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        INSERT INTO projects (name, project_code, industry, description, estimated_hours) 
        VALUES (@name, @projectCode, @industry, @description, @estimatedHours)", connection);
    command.Parameters.AddWithValue("@name", request.Name);
    command.Parameters.AddWithValue("@projectCode", request.projectCode ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@industry", request.Industry ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@estimatedHours", request.estimatedHours ?? 100);
    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/projects", new { message = "Project added" });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

// --- DASHBOARD COUNTS ---
app.MapGet("/api/dashboard-counts", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    
    // User counts
    var userCountCmd = new SqlCommand("SELECT COUNT(*) FROM users WHERE role = 'user'", connection);
    var userCount = (int)await userCountCmd.ExecuteScalarAsync()!;

    var adminCountCmd = new SqlCommand("SELECT COUNT(*) FROM users WHERE role = 'admin'", connection);
    var adminCount = (int)await adminCountCmd.ExecuteScalarAsync()!;

    var projectCountCmd = new SqlCommand("SELECT COUNT(*) FROM projects", connection);
    var projectCount = (int)await projectCountCmd.ExecuteScalarAsync()!;

    // Recent activities (timesheets + expenses)
    var recentCmd = new SqlCommand(@"
        SELECT TOP 5 *
        FROM (
            SELECT
                t.id,
                CAST('timesheet' AS NVARCHAR(20)) AS type,
                t.date AS event_date,
                CAST(t.hours AS DECIMAL(18,2)) AS amount,
                t.description AS detail,
                u.name AS user_name,
                p.name AS project_name,
                t.created_at
            FROM timesheets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN projects p ON t.project_id = p.id

            UNION ALL

            SELECT
                e.id,
                CAST('expense' AS NVARCHAR(20)) AS type,
                e.date AS event_date,
                CAST(e.amount AS DECIMAL(18,2)) AS amount,
                e.description AS detail,
                u.name AS user_name,
                CAST(NULL AS NVARCHAR(255)) AS project_name,
                e.created_at
            FROM expenses e
            JOIN users u ON e.user_id = u.id
        ) a
        ORDER BY a.created_at DESC", connection);
    
    var recentActivities = new List<object>();
    using (var reader = await recentCmd.ExecuteReaderAsync())
    {
        while (await reader.ReadAsync())
        {
            recentActivities.Add(new { 
                id = reader.GetInt32(0), 
                type = reader.GetString(1),
                date = reader.GetDateTime(2), 
                amount = reader.GetDecimal(3), 
                detail = reader.IsDBNull(4) ? "No description provided" : reader.GetString(4),
                user_name = reader.IsDBNull(5) ? "Unknown User" : reader.GetString(5),
                project_name = reader.IsDBNull(6) ? "N/A" : reader.GetString(6),
                created_at = reader.GetDateTime(7)
            });
        }
    }

    // Active projects progress
    var activeProjCmd = new SqlCommand(@"
        SELECT p.id, p.name, p.estimated_hours, COALESCE(SUM(t.hours), 0) as hours_spent
        FROM projects p
        LEFT JOIN timesheets t ON p.id = t.project_id
        GROUP BY p.id, p.name, p.estimated_hours", connection);
    
    var activeProjects = new List<object>();
    using (var reader = await activeProjCmd.ExecuteReaderAsync())
    {
        while (await reader.ReadAsync())
        {
            var estimated = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            var spent = reader.GetDecimal(3);
            var progress = estimated > 0 ? (int)Math.Min(100, Math.Round((spent / (decimal)estimated) * 100)) : 0;
            
            activeProjects.Add(new { 
                id = reader.GetInt32(0), 
                name = reader.GetString(1), 
                estimated_hours = estimated, 
                hours_spent = spent,
                progress = progress
            });
        }
    }

    return Results.Ok(new { userCount, adminCount, projectCount, recentActivities, activeProjects });
}).RequireAuthorization(p => p.RequireRole("superadmin"));

// --- WORK ATTACHMENTS ---
app.MapPost("/api/work-attachments", async (HttpContext context, IWebHostEnvironment env, IFormFile file) =>
{
    if (file is null || file.Length == 0)
    {
        return Results.BadRequest(new { message = "Please attach a valid file." });
    }

    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var uploadsDir = Path.Combine(env.ContentRootPath, "uploads", "work-attachments");
    Directory.CreateDirectory(uploadsDir);

    var extension = Path.GetExtension(file.FileName);
    var storedName = $"{Guid.NewGuid()}{extension}";
    var storedPath = Path.Combine(uploadsDir, storedName);

    await using (var stream = new FileStream(storedPath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var insertCmd = new SqlCommand(@"
        INSERT INTO work_attachments (user_id, original_name, stored_name, content_type, file_size)
        VALUES (@userId, @originalName, @storedName, @contentType, @fileSize);
        SELECT CAST(SCOPE_IDENTITY() AS INT);", connection);
    insertCmd.Parameters.AddWithValue("@userId", userId);
    insertCmd.Parameters.AddWithValue("@originalName", file.FileName);
    insertCmd.Parameters.AddWithValue("@storedName", storedName);
    insertCmd.Parameters.AddWithValue("@contentType", file.ContentType ?? "application/octet-stream");
    insertCmd.Parameters.AddWithValue("@fileSize", file.Length);

    var createdId = (int)await insertCmd.ExecuteScalarAsync()!;
    return Results.Ok(new { id = createdId, message = "Attachment uploaded successfully." });
}).RequireAuthorization().DisableAntiforgery();

app.MapGet("/api/work-attachments", async (HttpContext context) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT w.id, w.user_id, u.name as uploaded_by, u.role as uploader_role, w.original_name, w.content_type, w.file_size, w.created_at
        FROM work_attachments w
        JOIN users u ON u.id = w.user_id
        ORDER BY w.created_at DESC", connection);

    var items = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        items.Add(new
        {
            id = reader.GetInt32(0),
            user_id = reader.GetInt32(1),
            uploaded_by = reader.IsDBNull(2) ? "Unknown User" : reader.GetString(2),
            uploader_role = reader.IsDBNull(3) ? "user" : reader.GetString(3),
            original_name = reader.IsDBNull(4) ? "file" : reader.GetString(4),
            content_type = reader.IsDBNull(5) ? "application/octet-stream" : reader.GetString(5),
            file_size = reader.GetInt64(6),
            created_at = reader.GetDateTime(7)
        });
    }

    return Results.Ok(items);
}).RequireAuthorization();

app.MapGet("/api/work-attachments/{id}/download", async (int id, HttpContext context, IWebHostEnvironment env) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT user_id, original_name, stored_name, content_type FROM work_attachments WHERE id = @id", connection);
    command.Parameters.AddWithValue("@id", id);

    using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync())
    {
        return Results.NotFound(new { message = "Attachment not found." });
    }

    var originalName = reader.GetString(1);
    var storedName = reader.GetString(2);
    var contentType = reader.IsDBNull(3) ? "application/octet-stream" : reader.GetString(3);

    var uploadsDir = Path.Combine(env.ContentRootPath, "uploads", "work-attachments");
    var storedPath = Path.Combine(uploadsDir, storedName);
    if (!File.Exists(storedPath))
    {
        return Results.NotFound(new { message = "File not found on disk." });
    }

    var provider = new FileExtensionContentTypeProvider();
    if (!provider.TryGetContentType(originalName, out var safeContentType))
    {
        safeContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType;
    }

    return Results.File(storedPath, safeContentType, originalName);
}).RequireAuthorization();

app.MapDelete("/api/work-attachments/{id}", async (int id, HttpContext context, IWebHostEnvironment env) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var role = context.User.FindFirst(ClaimTypes.Role)?.Value ?? "user";
    var canDeleteAny = role is "admin" or "superadmin";

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT user_id, stored_name FROM work_attachments WHERE id = @id", connection);
    command.Parameters.AddWithValue("@id", id);

    using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync())
    {
        return Results.NotFound(new { message = "Attachment not found." });
    }
    var ownerId = reader.GetInt32(0);
    var storedName = reader.GetString(1);
    await reader.CloseAsync();

    if (!canDeleteAny && ownerId != userId)
    {
        return Results.Forbid();
    }

    var deleteCmd = new SqlCommand("DELETE FROM work_attachments WHERE id = @id", connection);
    deleteCmd.Parameters.AddWithValue("@id", id);
    await deleteCmd.ExecuteNonQueryAsync();

    var uploadsDir = Path.Combine(env.ContentRootPath, "uploads", "work-attachments");
    var storedPath = Path.Combine(uploadsDir, storedName);
    if (File.Exists(storedPath))
    {
        File.Delete(storedPath);
    }

    return Results.Ok(new { message = "Attachment deleted." });
}).RequireAuthorization();

// --- CHAT ---
app.MapGet("/api/chat/messages", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT TOP 200 c.id, c.sender_id, u.name, u.role, c.message, c.created_at
        FROM chat_messages c
        JOIN users u ON u.id = c.sender_id
        ORDER BY c.created_at ASC", connection);

    var messages = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        messages.Add(new
        {
            id = reader.GetInt32(0),
            sender_id = reader.GetInt32(1),
            sender_name = reader.IsDBNull(2) ? "Unknown User" : reader.GetString(2),
            sender_role = reader.IsDBNull(3) ? "user" : reader.GetString(3),
            message = reader.GetString(4),
            created_at = reader.GetDateTime(5)
        });
    }
    return Results.Ok(messages);
}).RequireAuthorization();

app.MapPost("/api/chat/messages", async (HttpContext context, ChatMessageRequest request) =>
{
    var text = request.message?.Trim();
    if (string.IsNullOrWhiteSpace(text))
    {
        return Results.BadRequest(new { message = "Message cannot be empty." });
    }

    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        INSERT INTO chat_messages (sender_id, message) VALUES (@senderId, @message);
        SELECT CAST(SCOPE_IDENTITY() AS INT);", connection);
    command.Parameters.AddWithValue("@senderId", userId);
    command.Parameters.AddWithValue("@message", text);
    var id = (int)await command.ExecuteScalarAsync()!;
    return Results.Ok(new { id, message = "Sent" });
}).RequireAuthorization();

// --- TIMESHEETS & EXPENSES ---
app.MapPost("/api/timesheets", async (HttpContext context, TimesheetRequest request) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("INSERT INTO timesheets (user_id, project_id, date, hours, description, task_category) VALUES (@userId, @projectId, @date, @hours, @description, @task_category)", connection);
    command.Parameters.AddWithValue("@userId", userId);
    command.Parameters.AddWithValue("@projectId", request.project_id);
    command.Parameters.AddWithValue("@date", request.Date);
    command.Parameters.AddWithValue("@hours", request.Hours);
    command.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@task_category", request.task_category ?? (object)DBNull.Value);
    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/timesheets", new { message = "Timesheet submitted" });
}).RequireAuthorization();

app.MapGet("/api/user/notifications", async (HttpContext context) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, message, created_at FROM notifications WHERE user_id IS NULL OR user_id = @userId ORDER BY created_at DESC", connection);
    command.Parameters.AddWithValue("@userId", userId);
    
    var results = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new { id = reader.GetInt32(0), message = reader.GetString(1), created_at = reader.GetDateTime(2) });
    }
    return Results.Ok(results);
}).RequireAuthorization();

app.MapGet("/api/user/stats", async (HttpContext context) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    
    var statsCmd = new SqlCommand(@"
        SELECT 
            (SELECT COALESCE(SUM(hours), 0) FROM timesheets WHERE user_id = @userId) as total_hours,
            (SELECT COUNT(*) FROM leave_requests WHERE user_id = @userId AND status = 'pending') as pending_approvals,
            (SELECT COUNT(*) FROM projects WHERE id IN (SELECT project_id FROM timesheets WHERE user_id = @userId)) as active_projects
    ", connection);
    statsCmd.Parameters.AddWithValue("@userId", userId);
    
    using var reader = await statsCmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        return Results.Ok(new { 
            total_hours = reader.GetDecimal(0), 
            pending_approvals = reader.GetInt32(1),
            active_projects = reader.GetInt32(2)
        });
    }
    return Results.NotFound();
}).RequireAuthorization();

app.MapGet("/api/user/weekly-hours", async (HttpContext context) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        WITH Last7Days AS (
            SELECT CAST(DATEADD(DAY, -v.n, CAST(GETDATE() AS DATE)) AS DATE) AS work_date
            FROM (VALUES (6), (5), (4), (3), (2), (1), (0)) v(n)
        )
        SELECT 
            d.work_date,
            COALESCE(SUM(t.hours), 0) AS total_hours
        FROM Last7Days d
        LEFT JOIN timesheets t 
            ON t.user_id = @userId
            AND CAST(t.date AS DATE) = d.work_date
        GROUP BY d.work_date
        ORDER BY d.work_date ASC", connection);
    command.Parameters.AddWithValue("@userId", userId);

    var result = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            date = reader.GetDateTime(0),
            total_hours = reader.GetDecimal(1)
        });
    }

    return Results.Ok(result);
}).RequireAuthorization();

app.MapPost("/api/leave-requests", async (HttpContext context, LeaveRequest request) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("INSERT INTO leave_requests (user_id, start_date, end_date, type, reason) VALUES (@userId, @start, @end, @type, @reason)", connection);
    command.Parameters.AddWithValue("@userId", userId);
    command.Parameters.AddWithValue("@start", request.start_date);
    command.Parameters.AddWithValue("@end", request.end_date);
    command.Parameters.AddWithValue("@type", request.type);
    command.Parameters.AddWithValue("@reason", request.reason ?? (object)DBNull.Value);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Leave request submitted" });
}).RequireAuthorization();

app.MapGet("/api/leave-requests", async (HttpContext context) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("SELECT id, start_date, end_date, type, status, reason, created_at FROM leave_requests WHERE user_id = @userId ORDER BY created_at DESC", connection);
    command.Parameters.AddWithValue("@userId", userId);
    
    var results = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new { 
            id = reader.GetInt32(0), 
            start_date = reader.GetDateTime(1), 
            end_date = reader.GetDateTime(2),
            type = reader.GetString(3),
            status = reader.GetString(4),
            reason = reader.IsDBNull(5) ? null : reader.GetString(5),
            created_at = reader.GetDateTime(6)
        });
    }
    return Results.Ok(results);
}).RequireAuthorization();

app.MapGet("/api/admin/leave-requests", async () =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT lr.id, lr.user_id, u.name, u.email, lr.start_date, lr.end_date, lr.type, lr.status, lr.reason, lr.created_at
        FROM leave_requests lr
        JOIN users u ON u.id = lr.user_id
        ORDER BY lr.created_at DESC", connection);

    var results = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new
        {
            id = reader.GetInt32(0),
            user_id = reader.GetInt32(1),
            user_name = reader.IsDBNull(2) ? "Unknown User" : reader.GetString(2),
            user_email = reader.IsDBNull(3) ? "N/A" : reader.GetString(3),
            start_date = reader.GetDateTime(4),
            end_date = reader.GetDateTime(5),
            type = reader.GetString(6),
            status = reader.GetString(7),
            reason = reader.IsDBNull(8) ? null : reader.GetString(8),
            created_at = reader.GetDateTime(9)
        });
    }
    return Results.Ok(results);
}).RequireAuthorization(p => p.RequireRole("admin", "superadmin"));

app.MapPut("/api/leave-requests/{id}/status", async (int id, HttpContext context, LeaveStatusUpdateRequest request) =>
{
    var newStatus = request.status?.Trim().ToLowerInvariant();
    if (newStatus is not ("approved" or "refused"))
    {
        return Results.BadRequest(new { message = "Status must be either 'approved' or 'refused'." });
    }

    var approverName = context.User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var getCmd = new SqlCommand("SELECT user_id, type, start_date, end_date, status FROM leave_requests WHERE id = @id", connection);
    getCmd.Parameters.AddWithValue("@id", id);
    using var reader = await getCmd.ExecuteReaderAsync();
    if (!await reader.ReadAsync())
    {
        return Results.NotFound(new { message = "Leave request not found." });
    }

    var userId = reader.GetInt32(0);
    var leaveType = reader.GetString(1);
    var startDate = reader.GetDateTime(2);
    var endDate = reader.GetDateTime(3);
    var currentStatus = reader.GetString(4).ToLowerInvariant();
    await reader.CloseAsync();

    if (currentStatus != "pending")
    {
        return Results.BadRequest(new { message = "Only pending requests can be updated." });
    }

    var updateCmd = new SqlCommand("UPDATE leave_requests SET status = @status WHERE id = @id", connection);
    updateCmd.Parameters.AddWithValue("@status", newStatus);
    updateCmd.Parameters.AddWithValue("@id", id);
    await updateCmd.ExecuteNonQueryAsync();

    var notificationMessage = $"Your {leaveType} request ({startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}) was {newStatus} by {approverName}.";
    var notifCmd = new SqlCommand("INSERT INTO notifications (message, user_id) VALUES (@message, @userId)", connection);
    notifCmd.Parameters.AddWithValue("@message", notificationMessage);
    notifCmd.Parameters.AddWithValue("@userId", userId);
    await notifCmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = $"Leave request {newStatus}." });
}).RequireAuthorization(p => p.RequireRole("admin", "superadmin"));

app.MapPut("/api/user/profile", async (HttpContext context, UserUpdateRequest request) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        UPDATE users 
        SET name = @name, mobile = @mobile, email = @email, gender = @gender, 
            birthdate = @birthdate, date_of_joining = @date_of_joining, username = @username
        WHERE id = @id", connection);
    
    command.Parameters.AddWithValue("@name", request.name ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@mobile", request.mobile ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@email", request.email);
    command.Parameters.AddWithValue("@gender", request.gender ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@birthdate", request.birthdate ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@date_of_joining", request.date_of_joining ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@username", request.username);
    command.Parameters.AddWithValue("@id", userId);

    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Profile updated successfully" });
}).RequireAuthorization();

app.MapPost("/api/expenses", async (HttpContext context, ExpenseRequest request) =>
{
    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("INSERT INTO expenses (user_id, date, amount, description) VALUES (@userId, @date, @amount, @description)", connection);
    command.Parameters.AddWithValue("@userId", userId);
    command.Parameters.AddWithValue("@date", request.Date);
    command.Parameters.AddWithValue("@amount", request.Amount);
    command.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/expenses", new { message = "Expense submitted" });
}).RequireAuthorization();

app.MapGet("/api/timesheets/export", async (DateTime startDate, DateTime endDate) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT t.*, u.name as user_name, p.name as project_name 
        FROM timesheets t 
        JOIN users u ON t.user_id = u.id 
        JOIN projects p ON t.project_id = p.id 
        WHERE t.date BETWEEN @startDate AND @endDate", connection);
    command.Parameters.AddWithValue("@startDate", startDate);
    command.Parameters.AddWithValue("@endDate", endDate);
    
    var results = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new { 
            id = reader.GetInt32(0),
            user_id = reader.GetInt32(1),
            project_id = reader.GetInt32(2),
            date = reader.GetDateTime(3),
            hours = reader.GetDecimal(4),
            description = reader.IsDBNull(5) ? null : reader.GetString(5),
            user_name = reader.IsDBNull(7) ? "Unknown User" : reader.GetString(7),
            project_name = reader.IsDBNull(8) ? "Unknown Project" : reader.GetString(8)
        });
    }
    return Results.Ok(results);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

app.MapGet("/api/expenses/export", async (DateTime startDate, DateTime endDate) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        SELECT e.*, u.name as user_name 
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.date BETWEEN @startDate AND @endDate", connection);
    command.Parameters.AddWithValue("@startDate", startDate);
    command.Parameters.AddWithValue("@endDate", endDate);
    
    var results = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new { 
            id = reader.GetInt32(0),
            user_id = reader.GetInt32(1),
            date = reader.GetDateTime(2),
            amount = reader.GetDecimal(3),
            description = reader.IsDBNull(4) ? null : reader.GetString(4),
            user_name = reader.IsDBNull(6) ? "Unknown User" : reader.GetString(6)
        });
    }
    return Results.Ok(results);
}).RequireAuthorization(p => p.RequireRole("superadmin"));

// --- NOTIFICATIONS ---
app.MapPost("/api/notifications", async (NotificationRequest request) =>
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand("INSERT INTO notifications (message, user_id) VALUES (@message, @userId)", connection);
    command.Parameters.AddWithValue("@message", request.message);
    command.Parameters.AddWithValue("@userId", request.user_id ?? (object)DBNull.Value);
    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/notifications", new { message = "Notification sent" });
}).RequireAuthorization(p => p.RequireRole("superadmin", "admin"));

app.Run();

void InitializeDatabase(string connString)
{
    // Skipping database creation as it's already done via sqlcmd
    using (var connection = new SqlConnection(connString))
    {
        connection.Open();
        var script = @"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
            CREATE TABLE users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255),
                mobile NVARCHAR(20),
                email NVARCHAR(255) UNIQUE NOT NULL,
                gender NVARCHAR(20), -- Male, Female, Other
                birthdate DATE,
                date_of_joining DATE,
                username NVARCHAR(255) UNIQUE NOT NULL,
                password NVARCHAR(255) NOT NULL,
                role NVARCHAR(20) DEFAULT 'user', -- superadmin, admin, user
                created_at DATETIME DEFAULT GETDATE()
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'projects')
            CREATE TABLE projects (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                project_code NVARCHAR(100),
                industry NVARCHAR(255),
                description NVARCHAR(MAX),
                estimated_hours INT DEFAULT 100,
                status NVARCHAR(20) DEFAULT 'active',
                created_at DATETIME DEFAULT GETDATE()
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'admin_user_assignments')
            CREATE TABLE admin_user_assignments (
                admin_id INT,
                user_id INT,
                PRIMARY KEY (admin_id, user_id),
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION -- SQL Server cycle prevention
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'timesheets')
            CREATE TABLE timesheets (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                project_id INT,
                date DATE NOT NULL,
                hours DECIMAL(5,2) NOT NULL,
                description NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'expenses')
            CREATE TABLE expenses (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                date DATE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                description NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
            CREATE TABLE notifications (
                id INT IDENTITY(1,1) PRIMARY KEY,
                message NVARCHAR(MAX) NOT NULL,
                user_id INT NULL, -- NULL for global, specific ID for user
                created_at DATETIME DEFAULT GETDATE()
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'leave_requests')
            CREATE TABLE leave_requests (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                type NVARCHAR(50) NOT NULL, -- Sick, Vacation, etc.
                status NVARCHAR(20) DEFAULT 'pending',
                reason NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'work_attachments')
            CREATE TABLE work_attachments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                original_name NVARCHAR(255) NOT NULL,
                stored_name NVARCHAR(255) NOT NULL,
                content_type NVARCHAR(100) NOT NULL,
                file_size BIGINT NOT NULL,
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_messages')
            CREATE TABLE chat_messages (
                id INT IDENTITY(1,1) PRIMARY KEY,
                sender_id INT NOT NULL,
                message NVARCHAR(MAX) NOT NULL,
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            );

            -- Ensure new columns exist in timesheets
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('timesheets') AND name = 'status')
            ALTER TABLE timesheets ADD status NVARCHAR(20) DEFAULT 'pending';

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('timesheets') AND name = 'admin_comment')
            ALTER TABLE timesheets ADD admin_comment NVARCHAR(MAX);

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('timesheets') AND name = 'task_category')
            ALTER TABLE timesheets ADD task_category NVARCHAR(100);

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('notifications') AND name = 'user_id')
            ALTER TABLE notifications ADD user_id INT NULL;
        ";
        var cmd = new SqlCommand(script, connection);
        cmd.ExecuteNonQuery();

        // Seed SuperAdmin
        var checkAdmin = new SqlCommand("SELECT COUNT(*) FROM users WHERE username = 'SuperAdmin'", connection);
        if ((int)checkAdmin.ExecuteScalar()! == 0)
        {
            var hashedPw = BCrypt.Net.BCrypt.HashPassword("Admin");
            var seedCmd = new SqlCommand("INSERT INTO users (name, email, username, password, role) VALUES ('Super Admin', 'superadmin@example.com', 'SuperAdmin', @pw, 'superadmin')", connection);
            seedCmd.Parameters.AddWithValue("@pw", hashedPw);
            seedCmd.ExecuteNonQuery();
        }
    }
}

// Request Models
public record LoginRequest(string username, string password);
public record UserCreateRequest(string? name, string? mobile, string email, string? gender, DateTime? birthdate, DateTime? date_of_joining, string username, string password, string role);
public record PasswordResetRequest(string password);
public record UserUpdateRequest(string? name, string? mobile, string email, string? gender, DateTime? birthdate, DateTime? date_of_joining, string username);
public record AssignRoleRequest(int admin_id, int[] user_ids);
public record ProjectCreateRequest(string Name, string? projectCode, string? Industry, string? Description, int? estimatedHours);
public record TimesheetRequest(int project_id, DateTime Date, decimal Hours, string? Description, string? task_category);
public record ExpenseRequest(DateTime Date, decimal Amount, string? Description);
public record NotificationRequest(string message, int? user_id);
public record LeaveRequest(DateTime start_date, DateTime end_date, string type, string? reason);
public record LeaveStatusUpdateRequest(string status);
public record ChatMessageRequest(string message);
