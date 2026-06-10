using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ALTAS.Controllers
{
    [Authorize]
    public class BarangayOfficialsController : BaseController
    {
        private readonly IBarangayOfficialsRepository _repo;
        private readonly IFileMaintenanceRepository _repofm;
        public BarangayOfficialsController(IBarangayOfficialsRepository repo, IFileMaintenanceRepository repofm)
        {
            _repo = repo;
            _repofm = repofm;
        }
        public IActionResult OfficialsInformation()
        {
            ViewBag.drpPosition = new SelectList(_repofm.GET_POSITION(), "PositionId", "PositionDescription");
            return View();
        }
 
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getBarangayOfficials(string searchKeyword)
        {
            var data = await _repo.GET_BRGYOFFICIALS(searchKeyword ?? string.Empty);
            return Json(data);
        }

        [HttpPost]
        public async Task<IActionResult> saveBarangayOfficial(BarangayOfficialsDTO dto)
        {
            //if (!ModelState.IsValid) { var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage); return BadRequest(errors); }

            var rtn = await _repo.SAVE_BRGYOFFICIALS(dto);
            return Json(new { rtn });
        }
    }
}
