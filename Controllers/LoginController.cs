using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ALTAS.Controllers
{
    public class LoginController : Controller
    {
        private readonly ICryptoService _repo;
        private readonly ISystemManagementRepository _sysrepo;

        public LoginController(ICryptoService repo, ISystemManagementRepository sysrepo)
        {
            _repo = repo;
            _sysrepo = sysrepo;
        }

        [HttpGet]
        public IActionResult LoginUser()
        {
            // If already logged in redirect to dashboard
            if (User.Identity.IsAuthenticated)
                return RedirectToAction("Dashboard", "Dashboard");

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ExecuteLogin(UserDTO model)
        {
            if (!ModelState.IsValid)
                return View("LoginUser", model);

            var result = await _sysrepo.VALIDATE_USER(model);

            if (!result.Success)
            {
                ModelState.AddModelError(string.Empty, result.Message);
                return View("LoginUser", model);
            }

            // ✅ Create claims from user data
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, result.User.UserId.ToString()),
                new Claim(ClaimTypes.Name, result.User.UserName),
                new Claim("FullName", $"{result.User.FirstName} {result.User.MiddleName} {result.User.LastName}".Trim()),
                new Claim("UserGroupId", result.User.UserGroupId.ToString()),
                new Claim("Position", result.User.Position.ToString()),
                new Claim("AppLocation", result.User.AppLocation.ToString()),
                new Claim("AppName", result.User.AppName.ToString()),
                new Claim("BarangayAddress", result.User.BarangayAddress.ToString()),
                new Claim("CityMunAddress", result.User.CityMunAddress.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);


            if (model.EntityCode == "Ticket")
            {
                return RedirectToAction("QueueTicketing", "Queue");
            }
            if (model.EntityCode == "Display")
            {
                return RedirectToAction("QueueDisplay", "Queue");
            }

            return RedirectToAction("Dashboard", "Dashboard");
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("LoginUser", "Login");
        }
    }
}