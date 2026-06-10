using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

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

    }
}
