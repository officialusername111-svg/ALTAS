using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Routing;

namespace ALTAS.Controllers
{
    [Authorize]
    public class ResidentController : BaseController
    {
        private readonly IResidentRepository _repo;
        private readonly IHouseholdRepository _repohh;
        private readonly IFileMaintenanceRepository _repofm;

        public ResidentController(IResidentRepository repo, IHouseholdRepository repohh, IFileMaintenanceRepository repofm)
        {
            _repo = repo;
            _repohh = repohh;
            _repofm = repofm;
        }

        public IActionResult ResidentInformation()
        {
            ViewBag.drpStreet = new SelectList(_repofm.GET_STREET(), "StreetId", "StreetName");
            ViewBag.drpPurok = new SelectList(_repofm.GET_PUROK(), "PurokId", "PurokName");
            return View();
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getHousehold(string searchKeyword)
        {
            var data = await _repohh.GET_HOUSEHOLD(searchKeyword);
            return Json(data);
        }

       
        [HttpPost]
        public async Task<IActionResult> saveHousehold(HouseholdDTO dto)
        {
            var rtn = await _repohh.SAVE_HOUSEHOLD(dto);
            return Json(new { rtn });
        }


        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getResident(string searchKeyword)
        {
            var data = await _repo.GET_RESIDENT(searchKeyword);
            return Json(data);
        }

        [HttpPost]
        public async Task<IActionResult> saveResident(ResidentDTO dto)
        {
            var rtn = await _repo.SAVE_RESIDENT(dto);
            return Json(new { rtn });
        }


        // Demographic list(PWD / IP / Senior / Women / Youth / Children)
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getDemographic(string category)
        {
            var data = await _repo.GET_RESIDENT_DEMOGRAPHIC(category);
            return Json(data);
        }

        // KPI counts for all demographic buckets + household toilet stats
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getDemographicKpi()
        {
            var data = await _repo.GET_DEMOGRAPHIC_KPI();
            return Json(data);
        }

        // Household list filtered by toilet status (withToilet = true/false)
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getHouseholdToilet(bool withToilet)
        {
            var data = await _repohh.GET_HOUSEHOLD_TOILET(withToilet);
            return Json(data);
        }


        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getHouseholdMembers(string searchKeyword)
        {
            var data = await _repohh.GET_HOUSEHOLD_MEMBERS(searchKeyword);
            return Json(data);
        }
    }
}
