using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ALTAS.Controllers
{
    public class BaseController : Controller
    {
        protected Guid CurrentUserId
        {
            get
            {
                var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(value, out var id) ? id : Guid.Empty;
            }
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            ViewBag.FullName = User.FindFirstValue("FullName");
            ViewBag.UserName = User.FindFirstValue(ClaimTypes.Name);
            ViewBag.Position = User.FindFirstValue("Position");
            ViewBag.UserGroupId = User.FindFirstValue("UserGroupId");

            ViewBag.AppLocation = User.FindFirstValue("AppLocation");
            ViewBag.AppName = User.FindFirstValue("AppName");
            ViewBag.BarangayAddress = User.FindFirstValue("BarangayAddress");
            ViewBag.CityMunAddress = User.FindFirstValue("CityMunAddress");

            base.OnActionExecuting(context);
        }
    }
}