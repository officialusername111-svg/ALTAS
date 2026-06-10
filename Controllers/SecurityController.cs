using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ALTAS.Controllers
{
    [Authorize]
    [ApiController]
    [Route("k4d5/54f71")]
    [IgnoreAntiforgeryToken]
    public class SecurityController : BaseController
    {
        private readonly IAntiforgery _antiforgery;

        public SecurityController(IAntiforgery antiforgery)
        {
            _antiforgery = antiforgery;
        }

        [HttpGet("x84123")]
        [IgnoreAntiforgeryToken]
        public IActionResult GetToken()
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

            return Ok(new
            {
                x9k5840 = tokens.RequestToken
            });
        }
    }
}
