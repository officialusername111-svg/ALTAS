using ALTAS.Models;
using ALTAS.Models.Config;
using ALTAS.Models.Interface;
using ALTAS.Models.REPO;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using QuestPDF.Infrastructure;
using System.Text.Json;



var builder = WebApplication.CreateBuilder(args);

var documentsPath = Path.Combine(Directory.GetCurrentDirectory(), "_documents");
if (!Directory.Exists(documentsPath)) { Directory.CreateDirectory(documentsPath); }

var incidentDocxPath = Path.Combine(Directory.GetCurrentDirectory(), "_incidentdocx");
if (!Directory.Exists(incidentDocxPath)) Directory.CreateDirectory(incidentDocxPath);


QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddSingleton<ICryptoService, CryptoService>();

builder.Services.Configure<ConnectionStringSettings>(
    builder.Configuration.GetSection("ConnectionStrings"));

builder.Services.AddScoped<IResidentRepository, ResidentRepository>();
builder.Services.AddScoped<IHouseholdRepository, HouseholdRepository>();
builder.Services.AddScoped<IBarangayOfficialsRepository, BarangayOfficialsRepository>();
builder.Services.AddScoped<IFileMaintenanceRepository, FileMaintenanceRepository>();
builder.Services.AddScoped<IArchiveDocumentRepository, ArchiveDocumentRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<ISystemManagementRepository, SystemManagementRepository>();
builder.Services.AddScoped<IQueueRepository, QueueRepository>();
builder.Services.AddScoped<IORRepository, ORRepository>();
builder.Services.AddScoped<ICTCCollectionRepository, CTCCollectionRepository>();
builder.Services.AddScoped<IIncidentRepository, IncidentRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();

// ✅ Add Cookie Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login/LoginUser";
        options.LogoutPath = "/Login/Logout";
        options.AccessDeniedPath = "/Login/LoginUser";
        options.SlidingExpiration = true;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(15);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
    });

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddAntiforgery(options => { options.HeaderName = "X-CSRF-TOKEN"; });

builder.Services.AddSignalR()
    .AddJsonProtocol(opt =>
        opt.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Expires"] = "0";
    await next();
});

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(documentsPath),
    RequestPath = "/documents"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(incidentDocxPath),
    RequestPath = "/incidentdocx"
});


app.UseRouting();
app.UseAuthentication();
app.UseAntiforgery();
app.UseAuthorization();

app.MapHub<QueueHub>("/queueHub");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=LoginUser}/{id?}");

app.Run();
